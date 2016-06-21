package com.utz.core.blog;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.DatastoreFailureException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.memcache.AsyncMemcacheService;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.utz.core.common.TextContent;
import com.utz.core.storage.IStorable;
import com.utz.core.users.AccessControlList;
import com.utz.core.users.ISupportAccessControls;

public class Blog implements IStorable, ISupportAccessControls {
	
	private static final DatastoreService DSTORE = DatastoreServiceFactory.getDatastoreService();
	private static final MemcacheService CACHE = MemcacheServiceFactory.getMemcacheService();
	private static final AsyncMemcacheService ASYNC_CACHE = MemcacheServiceFactory.getAsyncMemcacheService();
	
	private static final Logger LOG = Logger.getLogger(Blog.class.getName());
	
	/**
	 * Defines the kinds of {@link Entity}s that can be a parent of
	 * a Blog.<br>
	 * The list of acceptable parent entities is:
	 * <ul>
	 * 	<li><code>user</code> - as a personal blog</li>
	 * 	<li><code>user-group</code> - as a group blog</li>
	 * 	<li><code>project</code> - as a project blog</li>
	 * </ul>
	 */
	private static final String PARENT_WHITELIST = "user;user-group;project;";
	
	private Entity ent;
	
	/**
	 * Creates an instance of Blog to represent the Blog described in the
	 * Datastore by the given {@link Entity}.
	 * <br>
	 * If the given Entity does not have one of the kind's specified by {@link #PARENT_WHITELIST},
	 * an {@link IllegalArgumentExcpetion} will be thrown.
	 * @param ent
	 */
	public Blog(Entity ent) {
		if (!ent.getKind().equals("blog")) {
			throw new IllegalArgumentException("The given Entity is not of Kind \'blog\'");
		}
		
		this.ent = ent;
		
		ASYNC_CACHE.put("blog:" + ent.getKey().getId(), ent, Expiration.byDeltaSeconds(3600 * 16));
	}
	
	/**
	 * Creates a new Blog with the given title and parent {@link Entity}.
	 * <br>
	 * 
	 * 
	 * @param title
	 * @param parent
	 */
	public Blog(String title, Entity parent) {
		if (!PARENT_WHITELIST.contains(parent.getKind())) {
			throw new IllegalArgumentException("Blog cannot have parent of kind " + parent.getKind());
		}
		
		
	}
	
	/**
	 * Returns the title of this Blog.
	 * 
	 * @return blog's title
	 */
	public String getTitle() {
		return (String) ent.getProperty("blog-title");
	}
	
	/**
	 * Returns a {@link Key} that can be used to obtain the {@link TextContent} holding the description
	 * of this Blog.
	 * 
	 * @return description's Key
	 */
	public Key getDescriptionKey() {
		return (Key) ent.getProperty("blog-description");
	}
	
	// TODO:MAKE add posts to this blog
	// TODO:MAKE list/query posts in this blog
	//				return keys only, projections, or full objects with heads?
	
	@Override
	public Key getAclKey() {
		return (Key) ent.getProperty("object-acl");
	}

	@Override
	public Key getDatastoreKey() {
		return ent.getKey();
	}

	@Override
	public void storeDatastore(DatastoreService datastore, Transaction trx)
			throws DatastoreFailureException {
		datastore.put(trx, ent);
		ASYNC_CACHE.put("blog:" + ent.getKey().getId(), ent, Expiration.byDeltaSeconds(3600 * 16));
	}

	@Override
	public void fetchDatastore(DatastoreService datastore, Transaction trx)
			throws EntityNotFoundException {
		String cacheKey = "blog:" + ent.getKey().getId();
		
		if (CACHE.contains(cacheKey)) {
			ent = (Entity) CACHE.get(cacheKey);
			
		} else {
			ent = datastore.get(trx, ent.getKey());
		}
		
		ASYNC_CACHE.put(cacheKey, ent, Expiration.byDeltaSeconds(3600 * 16));
	}

	@Override
	public void storeDatastore() throws DatastoreFailureException {
		Transaction trx = DSTORE.beginTransaction();
		
		try {
			storeDatastore(DSTORE, trx);
			trx.commit();
			
		} catch (DatastoreFailureException e) {
			if (trx.isActive()) trx.rollback();
			throw e;
		}
	}

	@Override
	public void fetchDatastore() throws EntityNotFoundException {
		Transaction trx = DSTORE.beginTransaction();
		
		try {
			fetchDatastore(DSTORE, trx);
			trx.commit();
			
		} catch (EntityNotFoundException e) {
			if (trx.isActive()) trx.rollback();
			throw e;
		}
	}
}
