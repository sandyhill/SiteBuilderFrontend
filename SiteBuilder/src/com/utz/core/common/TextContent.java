package com.utz.core.common;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.api.client.http.InputStreamContent;
import com.google.api.services.storage.Storage;
import com.google.api.services.storage.model.ObjectAccessControl;
import com.google.api.services.storage.model.StorageObject;
import com.google.appengine.api.appidentity.AppIdentityService;
import com.google.appengine.api.appidentity.AppIdentityServiceFactory;
import com.google.appengine.api.datastore.AsyncDatastoreService;
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
import com.utz.core.storage.IAsyncStorable;
import com.utz.core.storage.IStorable;
import com.utz.core.storage.StorageFactory;
import com.utz.core.users.AccessControlList;
import com.utz.core.users.ISupportAccessControls;
import com.utz.core.utils.ShardedCounter;

public class TextContent implements IStorable, IAsyncStorable, ISupportAccessControls {

	private static final DatastoreService DSTORE = DatastoreServiceFactory.getDatastoreService();
	private static final AsyncDatastoreService ASYNC_DSTORE = DatastoreServiceFactory.getAsyncDatastoreService();
	private static final MemcacheService CACHE = MemcacheServiceFactory.getMemcacheService();
	private static final AsyncMemcacheService ASYNC_CACHE = MemcacheServiceFactory.getAsyncMemcacheService();
	private static final AppIdentityService APP_IDENTITY = AppIdentityServiceFactory.getAppIdentityService();
	
	private static Storage STORAGE_SVC = StorageFactory.getStorage();
	
	private static final Logger LOG = Logger.getLogger(TextContent.class.getName());
	private static final ShardedCounter COUNTER = ShardedCounter.counterByName("text-content-counter", 15);
	private static final Key ROOT_KEY = KeyFactory.createKey("datastore-root", "text-content-root");
	
	/**
	 * Defines the kinds of {@link Entity}s that can be a parent of
	 * a TextContent.<br>
	 * The list of acceptable parent entities is:
	 * <ul>
	 * 	<li><code>blog</code> - as the description of the blog</li>
	 * 	<li><code>blog-post</code> - as the content of the post</li>
	 * 	<li><code>user</code> -  as a bio</li>
	 * 	<li><code>user-group</code> - as a description of the group</li>
	 * 	<li><code>wiki</code> - as the content of the wiki home page</li>
	 * 	<li><code>wiki-branch</code> - as the content of the branch home page</li>
	 * 	<li><code>wiki-article</code> - as the content of the article</li>
	 * 	<li><code>project</code> - as a description of the project</li>
	 * 	<li><code>stream</code> - as a description of the stream</li>
	 * </ul>
	 */
	private static final String PARENT_WHITELIST = "blog-post;blog;user;user-group;wiki;wiki-article;wiki-branch;project;stream";
	
	private Entity ent;

	public TextContent(String title, long owner, Key parent) {
		if (!PARENT_WHITELIST.contains(parent.getKind())) {
			throw new IllegalArgumentException("TextContent cannot be child of a " + parent.getKind());
		}
		//TODO: GCS object???
		this.ent = new Entity("text-content", ROOT_KEY);
		ent.setProperty("text-content-parent", parent);
		ent.setProperty("text-content-title", title);
		ent.setProperty("text-content-created", System.currentTimeMillis());
		ent.setProperty("text-content-owner", owner);//TODO: implement ACL system
		ent.setUnindexedProperty("text-content-updated", System.currentTimeMillis());
		COUNTER.increment();
	}

	/**
	 * Creates a new TextContent, using the given {@link Entity} as a source
	 * of information.
	 * <br>
	 * If the given Entity does not have one of the kind's specified by {@link #PARENT_WHITELIST},
	 * an {@link IllegalArgumentExcpetion} will be thrown.
	 * @param ent an Entity storing data about the TextContent
	 */
	public TextContent(Entity ent) {
		if (!ent.getKind().equals("text-content")) throw new IllegalArgumentException("The given Entity is not of the kind text-content");
		this.ent = ent;
		ASYNC_CACHE.put("text-content:" + ent.getKey().getId(), ent, Expiration.byDeltaSeconds(3600 * 24));//TODO: expiry time
	}

	/**
	 * Returns a TextContent with the given ID number, if any such TextContent exists.
	 * 
	 * @param id the id of the TextContent to retrieve
	 * @return a TextContent, or null
	 */
	public TextContent contentByID(long id) {
		Transaction trx;
		Entity ent;

		if (CACHE.contains("text-content:" + id)) {
			ent = (Entity) CACHE.get("text-content:" + id);
			
		} else {
			trx = DSTORE.beginTransaction();

			try {
				ent = DSTORE.get(trx, KeyFactory.createKey("text-content", id));
				trx.commit();

			} catch (EntityNotFoundException e) {
				LOG.log(Level.WARNING, "Attempt to fetch non-existent TextContent id=" + id, e);
				if (trx.isActive()) trx.rollback();
				return null;
			}
		}

		return new TextContent(ent);
	}

	/**
	 * Returns the title of this TextContent.
	 * @return title
	 */
	public String getTitle() {
		return (String) ent.getProperty("text-content-title");
	}

	/**
	 * Returns the {@link Key} of parent of this TextContent.
	 * @return parent's Key
	 */
	public Key getParent() {
		return (Key) ent.getProperty("text-content-parent");
	}

	@Override
	public Key getDatastoreKey() {
		return this.ent.getKey();
	}
	
	/**
	 * Returns the timestamp of the date when this TextContent was created.
	 * @return date created
	 */
	public long getDateCreated() {
		return (long) ent.getProperty("text-content-created");
	}

	/**
	 * Returns the timestamp of the date when this TextContent was last updated.
	 * @return date updated
	 */
	public long getDateUpdated() {
		return (long) ent.getProperty("text-content-updated");
	}

	/**
	 * Returns the ID number identifying the user who owns this TextContent.
	 * @return owner's ID
	 */
	public long getOwnerID() {
		return (long) ent.getProperty("text-content-owner");
	}

	/**
	 * Returns the name of the Google Cloud Storage object storing the
	 * content of this TextContent.
	 * @return Google Cloud Storage object name
	 */
	public String getStorageObjectName() {
		return (String) ent.getProperty("text-content-storage-name");
	}
	
	/**
	 * Sets the date on which this TextContent was last updated.
	 * @param date the date on which the TextContent was updated
	 */
	public void setDateUpdated(long date) {
		this.ent.setProperty("text-content-updated", date);
	}

	/**
	 * Returns an {@link InputStream} to read the content of this TextContent
	 * from Cloud Storage.
	 * @return content input stream
	 * @throws IOException 
	 */
	public InputStream getContentInputStream() throws IOException {
		Storage.Objects.Get getReq = STORAGE_SVC.objects().get(APP_IDENTITY.getDefaultGcsBucketName(), getStorageObjectName());
		
		return getReq.executeMediaAsInputStream();
	}
	
	/**
	 * Writes the contents of the given {@link InputStream} to the Cloud Storage Object
	 * containing the content of this TextContent.
	 * <br>
	 * The content of the input source should be of type text/html.
	 * 
	 * @param src the source of data to upload
	 * @param length the length of the data, or -1 if unknown
	 * @throws IOException there was a problem uploading the given content stream
	 */
	public void writeContent(InputStream src, long length) throws IOException {
		InputStreamContent content = new InputStreamContent("text/html", src);
		content.setLength(length);
		
		StorageObject storObj = new StorageObject()
			.setName(getStorageObjectName())
			.setAcl(Arrays.asList(
					new ObjectAccessControl().setEntity("allUsers").setRole("READER")
					));
		
		Storage.Objects.Insert insertReq = STORAGE_SVC.objects().insert(APP_IDENTITY.getDefaultGcsBucketName(), storObj, content);
		
		insertReq.execute();
	}
	
	/**
	 * Returns a URL that can be used to publicly serve the content of this
	 * TextContent directly from Cloud Storage.
	 * @return public serving URL
	 */
	public String getServingUrl() {
		return "https://storage.googleapis.com/" + APP_IDENTITY.getDefaultGcsBucketName() + "/" + this.ent.getProperty("text-content-storage-name");
	}
	
	/**
	 * Returns the URL from which the TextContent's meta data should be served.
	 * 
	 * @return meta-data serving url
	 */
	public String getMetaUrl() {
		return "https://";
	}
	
	@Override
	public void storeDatastore(DatastoreService datastore, Transaction trx) {
		try {
			datastore.put(trx, ent);

		} catch (DatastoreFailureException e) {
			LOG.log(Level.WARNING, "[storeDatastore] DatastoreFailure while trying to put TextContent id=" + ent.getKey().getId(), e);
			trx.rollback();
			return;
		}
		ASYNC_CACHE.put("text-content:" + ent.getKey().getId(), ent, Expiration.byDeltaSeconds(3600 * 24));//TODO: expiry time
	}

	@Override
	public void fetchDatastore(DatastoreService datastore, Transaction trx) {
		try {
			this.ent = datastore.get(trx, ent.getKey());

		} catch (EntityNotFoundException e) {
			LOG.log(Level.WARNING, "[fetchDatastore] TextContent Entity not found id=" + ent.getKey().getId(), e);
			trx.rollback();
		}
	}

	@Override
	public void storeDatastore() {
		Transaction trx = DSTORE.beginTransaction();
		storeDatastore(DSTORE, trx);
		if (trx.isActive()) trx.commit();
	}

	/**
	 * {@inheritDoc}
	 * <b>Note:</b> This method may result in the retrieval of a cached 
	 * version of the TextContent. If there is reason to believe that
	 * the cached version is invalid, use {@link #fetchDatastore(DatastoreService, Transaction)}.
	 */
	@Override
	public void fetchDatastore() {
		String key = "text-content:" + ent.getKey().getId();
		if (CACHE.contains(key)) {
			this.ent = (Entity) CACHE.get(key);

		} else {
			Transaction trx = DSTORE.beginTransaction();
			fetchDatastore(DSTORE, trx);
			if (trx.isActive()) trx.commit();
		}
	}

	@Override
	public void beginStoreDatastore() {
		Transaction trx = DSTORE.beginTransaction();
		beginStoreDatastore(ASYNC_DSTORE, trx);
		if (trx.isActive()) trx.commitAsync();
	}

	@Override
	public void beginStoreDatastore(AsyncDatastoreService datastore, Transaction trx) {
		datastore.put(trx, ent);
		ASYNC_CACHE.put("text-content:" + ent.getKey().getId(), ent, Expiration.byDeltaSeconds(3600 * 24));//TODO: expiry time
	}

	@Override
	public AccessControlList getACL() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Key getAclKey() {
		return (Key) ent.getProperty("object-acl");
	}

}
