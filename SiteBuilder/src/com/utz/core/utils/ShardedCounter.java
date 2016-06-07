package com.utz.core.utils;

import java.util.ConcurrentModificationException;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskHandle;
import com.google.appengine.api.taskqueue.TaskOptions;
import com.utz.core.storage.IStorable;

/**
 * The ShardedCounter implements a globally consistent counter using multiple
 * sub-counters or "shards" stored in the Google Cloud Datastore.<br>
 * 
 * @author Nicholas Utz
 */
public class ShardedCounter implements IStorable {
	
	private static final Random RNG = new Random();
	private static final DatastoreService D_STORE = DatastoreServiceFactory.getDatastoreService();
	private static final Logger LOG = Logger.getLogger(ShardedCounter.class.getName());
	private static final MemcacheService CACHE = MemcacheServiceFactory.getMemcacheService();
	
	public static final String CACHE_COUNT_PREFIX = "Count:";
	public static final String CACHE_ERROR_PREFIX = "Errors";
	public static final String CACHE_SHARDS_PREFIX = "Shards:";
	
	private Entity ent;
	
	private String name;
	
	private final String cacheCountKey;
	private final String cacheShardsKey;
	private final String cacheErrorKey;
	
	/**
	 * Creates a new ShardedCounter with the given name and initial number of shards.
	 * 
	 * @param name the name of the ShardedCounter
	 * @param initialShards the initial number of shards that the new counter should have
	 */
	public ShardedCounter(String name, int initialShards) {
		this.ent = new Entity("shard-counter", "sharded-counter-" + name, KeyFactory.createKey("root", "shard-counter-root"));
		ent.setUnindexedProperty("shard-count", initialShards);
		ent.setUnindexedProperty("counter-name", name);
		ent.setUnindexedProperty("error-count", 0);
		
		this.cacheCountKey = CACHE_COUNT_PREFIX + ent.getKey().getName();
		this.cacheShardsKey = CACHE_SHARDS_PREFIX + ent.getKey().getName();
		this.cacheErrorKey = CACHE_ERROR_PREFIX + ent.getKey().getName();

		CACHE.put(this.cacheShardsKey, initialShards);
		CACHE.put(this.cacheErrorKey, 0);
		
		this.name = name;
	}
	
	/**
	 * Creates a new ShardedCounter using the given {@link Entity} as a source
	 * of information.
	 * 
	 * @param src an Entity representing the ShardedCOunter in the Datastore
	 */
	public ShardedCounter(final Entity src) {
		if (!src.getKind().equals("shard-counter")) throw new IllegalArgumentException("The given Entity is not of kind shard-counter");
		this.ent = src;
		this.cacheCountKey = CACHE_COUNT_PREFIX + ent.getKey().getName();
		this.cacheShardsKey = CACHE_SHARDS_PREFIX + ent.getKey().getName();
		this.cacheErrorKey = CACHE_ERROR_PREFIX + ent.getKey().getName();
		
		CACHE.put(this.cacheShardsKey, ent.getProperty("shard-count"));
		CACHE.put(this.cacheErrorKey, ent.getProperty("error-count"));
		
		this.name = (String) ent.getProperty("counter-name");
	}
	
	/**
	 * Returns a ShardedCounter object with the given name.
	 * <br>
	 * The second argument determines the behavior of the method when there is no ShardedCounter found
	 * with the given name. If the method is passed a value less than or equal to zero, then null is returned
	 * if no entity with the given name is found. Otherwise, it creates and returns a new ShardedCounter with
	 * the given number of shards.
	 * <br>
	 * <b>Note:</b> Retrieving an existing ShardedCounter with a <code>shards</code> value greater than the number
	 * of shards that the counter already has will not result in the counter gaining new shards.
	 * 
	 * @param name the name of the ShardedCounter to find or create
	 * @param shards the number of shards to create if no ShardedCounter is found, or 0 to not create a new counter
	 * @return a ShardedCounter with the given name
	 */
	public static ShardedCounter counterByName(String name, int shards) {
		Key key = KeyFactory.createKey(KeyFactory.createKey("root", "sharded-counter-root"), "sharded-counter", "sharded-counter-" + name);
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Transaction trx = datastore.beginTransaction();
		
		Entity ent;
		
		try {
			ent = datastore.get(trx, key);
			trx.commit();
			return new ShardedCounter(ent);
			
		} catch (EntityNotFoundException e) {
			if (shards > 0) {
				ShardedCounter counter = new ShardedCounter(name, shards);
				counter.storeDatastore(datastore, trx);
				trx.commit();
				return counter;
				
			} else {
				return null;
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			if (trx.isActive()) trx.rollback();
			return null;
			
		} finally {
			if (trx.isActive()) trx.rollback();
		}
	}

	/**
	 * Increases the number of shards in this ShardedCounter by the given amount.
	 * 
	 * @param newShardCount
	 */
	public void addShards(int newShardCount) {
		int shardCount = getShardCount();
		shardCount += newShardCount;
		ent.setUnindexedProperty("shard-count", shardCount);
		
		Transaction trx = D_STORE.beginTransaction();
		try {
			D_STORE.put(trx, ent);
			trx.commit();
			
		} catch (Exception e) {
			LOG.log(Level.WARNING, e.getMessage(), e);
		}
		
		if (CACHE.contains(this.cacheShardsKey)) {
			CACHE.increment(this.cacheShardsKey, newShardCount);
		}
	}
	
	/**
	 * Returns the number of shards in this ShardedCounter.<br>
	 * If the shard count is stored in the Memcache, then the cached value
	 * is returned. Otherwise, it is fetched from he Datastore and cached.
	 * 
	 * @return number of shards
	 */
	public int getShardCount() {
		if (CACHE.contains(this.cacheShardsKey)) {
			return (int) CACHE.get(this.cacheShardsKey);
			
		} else {
			Transaction trx = D_STORE.beginTransaction();
			fetchDatastore(D_STORE, trx);
			int shardCount = (int) ent.getProperty("shard-count");
			CACHE.put(this.cacheShardsKey, shardCount);
			return shardCount;
		}
	}
	
	/**
	 * Increments this ShardedCounter.
	 * <br>
	 * If a {@link ConcurrentModificationException} occurs, then the increment operation
	 * is abandoned and the exception logged.
	 * <br>
	 * If the ShardedCounter's count is stored in the Memcache, then the value in the Memcache
	 * is incremented.
	 */
	public void increment() {
		int shardCount = getShardCount();
		int shardNum = RNG.nextInt(shardCount);
		Key shardKey = KeyFactory.createKey(ent.getKey(), "counter-shard", Integer.toString(shardNum));
		
		Transaction trx = D_STORE.beginTransaction();
		Entity shard;
		try {
			try {
				shard = D_STORE.get(trx, shardKey);
				long count = (long) shard.getProperty("count");
				shard.setUnindexedProperty("count", count++);
				
			} catch (EntityNotFoundException e) {
				shard = new Entity(shardKey);
				shard.setUnindexedProperty("count", 1L);
			}
			D_STORE.put(shard);
			trx.commit();
			
			if (CACHE.contains(this.cacheCountKey)) {
				CACHE.increment(this.cacheCountKey, 1L);
			}
		} catch (ConcurrentModificationException e) {
			LOG.log(Level.WARNING, "Concurrent Modification in " + ent.getKey().getName(), e);
			CACHE.increment(cacheErrorKey, 1L, 1L);
			CounterGrowTask.debounceTask(ent.getKey().getName(), this.cacheErrorKey, KeyFactory.keyToString(ent.getKey()));
			//try another shard?
			
		} catch (Exception e) {
			LOG.log(Level.WARNING, e.toString(), e);
			
		} finally {
			if (trx.isActive()) trx.rollback();
		}
		//geez... all that just to increment a counter...
	}
	
	/**
	 * Returns the count of this ShardedCounter.<br>
	 * If the count is already stored in the Memcache, then the cached value
	 * is returned. Otherwise, all of the ShardedCounter's shards are fetched
	 * from the Datastore, and their values summed. The counter's count is
	 * always cached after it is fetched.
	 * 
	 * @return ShardedCounter's count
	 */
	public long getCount() {
		long val = 0;
		
		if (CACHE.contains(CACHE_COUNT_PREFIX + ent.getKey().getName())) {
			val = (long) CACHE.get(CACHE_COUNT_PREFIX + ent.getKey().getName());
			
		} else {
			Query q = new Query("counter-shard", ent.getKey());
			for (Entity ent : D_STORE.prepare(q).asIterable()) {
				val += (long) ent.getProperty("count");
			}
			
			CACHE.put(CACHE_COUNT_PREFIX + ent.getKey().getName(), val);
		}
		
		return val;
	}
	
	@Override
	public void storeDatastore(DatastoreService datastore, Transaction trx) {
		//TODO: Exception handling
		datastore.put(trx, ent);
	}

	@Override
	public void fetchDatastore(DatastoreService datastore, Transaction trx) {
		try {
			this.ent = datastore.get(trx, ent.getKey());
			
		} catch (EntityNotFoundException e) {
			LOG.log(Level.WARNING, "[fetchDatastore] ShardedCounter Entity not found name=" + name, e);
		}
	}


	@Override
	public void storeDatastore() {
		//TODO: Exception handling
		Transaction trx = D_STORE.beginTransaction();
		storeDatastore(D_STORE, trx);
		if (trx.isActive()) trx.commit();
	}
	

	@Override
	public void fetchDatastore() {
		//TODO: Exception handling
		Transaction trx = D_STORE.beginTransaction();
		fetchDatastore(D_STORE, trx);
		if (trx.isActive()) trx.commit();
	}

	@Override
	public Key getDatastoreKey() {
		return this.ent.getKey();
	}

}
/**
 * CounterGrowTask is a {@link DeferredTask} that increases the number of shards in a {@link ShardedCounter}.
 * <br>
 * Use the {@link CounterGrowTask#debounceTask()} to make sure that multiple CounterGrowTasks aren't enqueued
 * at the same time.
 * <br>
 * CounterGrowTask uses the counter's Memcache-based error count to determine how many new shards to create.
 * 
 * @author Nicholas Utz
 */
class CounterGrowTask implements DeferredTask {
	private static final long serialVersionUID = 4875692452883392180L;
	
	private static final MemcacheService CACHE = MemcacheServiceFactory.getMemcacheService();
	private static final DatastoreService D_STORE = DatastoreServiceFactory.getDatastoreService();
	private static final Logger LOG = Logger.getLogger(CounterGrowTask.class.getName());
	
	private static final String CACHE_TASK_PREFIX = "GrowTask:";
	private static final int DEBOUNCE_DURATION = 5000;
	
	private String errorCountKey;
	private String counterKey;
	
	public CounterGrowTask(String errorCountKey, String counterKey) {
		this.errorCountKey = errorCountKey;
		this.counterKey = counterKey;
	}
	
	public static void debounceTask(String counterName, String errorCountKey, String counterKey) {
		String taskKey = CACHE_TASK_PREFIX + counterName;
		
		if (CACHE.contains(taskKey)) {
			//do nothing
			
		} else {
			CounterGrowTask task = new CounterGrowTask(errorCountKey, counterKey);
			
			Queue q = QueueFactory.getDefaultQueue();
			TaskHandle tHandle = q.add(TaskOptions.Builder.withPayload(task).countdownMillis(DEBOUNCE_DURATION));
			
			CACHE.put(taskKey, tHandle, Expiration.byDeltaMillis(DEBOUNCE_DURATION));
		}
	}
	
	@Override
	public void run() {
		Key key = KeyFactory.stringToKey(counterKey);
		Entity ent;
		int errors = -1;
		
		try {
			ent = D_STORE.get(key);
			ShardedCounter counter = new ShardedCounter(ent);
			
			if (CACHE.contains(errorCountKey)) errors = (int) CACHE.get(errorCountKey);
			
			counter.addShards(errors > 2 ? errors / 2 : 2);//need to come up with some better logic to determine growth rate.
			
			CACHE.delete(errorCountKey);
			
		} catch (EntityNotFoundException e) {
			LOG.log(Level.WARNING, "Exception in CounterGrowTask", e);
		}
	}
}