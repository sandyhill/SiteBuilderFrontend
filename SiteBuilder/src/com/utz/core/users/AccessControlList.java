package com.utz.core.users;

import com.google.appengine.api.datastore.DatastoreFailureException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.memcache.AsyncMemcacheService;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.utz.core.storage.IStorable;

public class AccessControlList implements IStorable {
	
	private static final DatastoreService DSTORE = DatastoreServiceFactory.getDatastoreService();
	private static final MemcacheService CACHE = MemcacheServiceFactory.getMemcacheService();
	private static final AsyncMemcacheService ASYNC_CACHE = MemcacheServiceFactory.getAsyncMemcacheService();
	private static final Key ROOT_KEY = KeyFactory.createKey("acl-root", "acl-root");

	private static final String OWNER_WHITELIST = "user;user-group;project;";
	
	private Entity ent;

	public AccessControlList(Entity ent) {
		if (!ent.getKind().equals("user-acl")) {
			throw new IllegalArgumentException("The given Entity is not of kind user-acl");
		}
		
		this.ent = ent;
		
		ASYNC_CACHE.put("acl:" + ent.getKey().getId(), ent, Expiration.byDeltaMillis(3600 * 24));
	}
	
	public AccessControlList(Key owner) {
		this.ent = new Entity("user-acl", ROOT_KEY);
		
		if (!OWNER_WHITELIST.contains(owner.getKind())) {
			throw new IllegalArgumentException("Invalid ACL owner kind: " + owner.getKind());
		}
		
		ent.setProperty("user-acl-owner", owner);
		
		ASYNC_CACHE.put("acl:" + ent.getKey().getId(), ent);
	}
	
	public static AccessControlList aclFromKey(Key key) throws EntityNotFoundException {
		String cacheKey = "acl:" + key.getId();
		
		if (CACHE.contains(cacheKey)) {
			return new AccessControlList((Entity) CACHE.get(cacheKey));
			
		} else {
			return new AccessControlList((Entity) DSTORE.get(key));
		}
	}
	
	public long getOwnerId() {
		return 0;
	}
	
	@Override
	public void storeDatastore(DatastoreService datastore, Transaction trx) throws DatastoreFailureException {
		// TODO Auto-generated method stub

		ASYNC_CACHE.put("acl:" + ent.getKey().getId(), ent, Expiration.byDeltaMillis(3600 * 24));
	}

	@Override
	public void fetchDatastore(DatastoreService datastore, Transaction trx) throws EntityNotFoundException {
		// TODO Auto-generated method stub

	}

	@Override
	public void storeDatastore() throws DatastoreFailureException {
		// TODO Auto-generated method stub

	}

	@Override
	public void fetchDatastore() throws EntityNotFoundException {
		// TODO Auto-generated method stub

	}

	@Override
	public Key getDatastoreKey() {
		// TODO Auto-generated method stub
		return null;
	}

}
