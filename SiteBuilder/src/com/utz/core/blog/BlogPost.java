package com.utz.core.blog;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.DatastoreFailureException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.memcache.AsyncMemcacheService;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.utz.core.common.ITextContentParent;
import com.utz.core.common.TextContent;
import com.utz.core.storage.IStorable;
import com.utz.core.users.AccessControlList;
import com.utz.core.users.ISupportAccessControls;

public class BlogPost implements IStorable, ISupportAccessControls, ITextContentParent {
	
	private static final DatastoreService DSTORE = DatastoreServiceFactory.getDatastoreService();
	private static final MemcacheService CACHE = MemcacheServiceFactory.getMemcacheService();
	private static final AsyncMemcacheService ASYNC_CACHE = MemcacheServiceFactory.getAsyncMemcacheService();
	
	private static final Logger LOG = Logger.getLogger(BlogPost.class.getName());
	private static final Key ROOT_KEY = KeyFactory.createKey("datastore-root", "blog-post-root");

	private Entity ent;

	public BlogPost(String title, Blog parent) throws EntityNotFoundException {
		this.ent = new Entity("blog-post", ROOT_KEY);
		
		AccessControlList parentACL = AccessControlList.aclFromKey(parent.getAclKey());
		
		
		TextContent content = new TextContent(title, parentACL.getOwnerId(), ent.getKey());
	}
	
	public BlogPost(Entity ent) {
		if (!ent.getKind().equals("blog-post")) throw new IllegalArgumentException("The given Entity is not of kind blog-post");
		this.ent = ent;
		ASYNC_CACHE.put("blog-post:" + this.ent.getKey().getId(), this.ent, Expiration.byDeltaSeconds(3600 * 12));
	}
	
	public BlogPost(Key key) throws EntityNotFoundException {
		if (!key.getKind().equals("blog-post")) throw new IllegalArgumentException("The given Key is not of kind blog-post");
		
		String sKey = "blog-post:" + key.getId();
		if (CACHE.contains(sKey)) {
			this.ent = (Entity) CACHE.get(sKey);
			
		} else {
			this.ent = DSTORE.get(key);
			
		}
		
		ASYNC_CACHE.put(sKey, this.ent, Expiration.byDeltaSeconds(3600 * 12));
	}
	
	public String getTitle() {
		return (String) ent.getProperty("blog-post-title");
	}
	
	public Key getImageKey() {
		return (Key) ent.getProperty("blog-post-image");
	}
	
	public String getSummary() {
		return ((Text) ent.getProperty("blog-post-summary")).getValue();
	}
	
	public Key getContentKey() {
		return (Key) ent.getProperty("blog-post-content");
	}
	
	public Key getDirectoryKey() {
		return (Key) ent.getProperty("blog-post-directory");
	}
	
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
		
		ASYNC_CACHE.put("blog-post:" + this.ent.getKey().getId(), this.ent, Expiration.byDeltaSeconds(3600 * 12));
	}

	@Override
	public void fetchDatastore(DatastoreService datastore, Transaction trx)
			throws EntityNotFoundException {
		this.ent = datastore.get(trx, ent.getKey());
		
		ASYNC_CACHE.put("blog-post:" + this.ent.getKey().getId(), this.ent, Expiration.byDeltaSeconds(3600 * 12));
	}

	@Override
	public void storeDatastore() throws DatastoreFailureException {
		Transaction txn = DSTORE.beginTransaction();
		
		try {
			storeDatastore(DSTORE, txn);
			txn.commit();
			
		} catch (DatastoreFailureException e) {
			LOG.log(Level.WARNING, "Unable to store blog-post", e);
			if (txn.isActive()) txn.rollback();
			throw e;
		}

	}

	@Override
	public void fetchDatastore() throws EntityNotFoundException {
		Transaction txn = DSTORE.beginTransaction();
		
		try {
			fetchDatastore(DSTORE, txn);
			txn.commit();
			
		} catch (EntityNotFoundException e) {
			LOG.log(Level.WARNING, "Unable to fetch blog-post", e);
			if (txn.isActive()) txn.rollback();
			throw e;
		}

	}

}
