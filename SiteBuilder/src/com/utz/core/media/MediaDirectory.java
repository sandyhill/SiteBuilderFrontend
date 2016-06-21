package com.utz.core.media;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

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
import com.google.appengine.api.taskqueue.DeferredTask;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions;
import com.utz.core.storage.IStorable;
import com.utz.core.users.AccessControlList;
import com.utz.core.users.ISupportAccessControls;

/**
 * A MediaDirectory represents a directory or "folder" containing user data.
 * MediaDirectories are purely logical constructs, they do not necessarily represent
 * any kind of hierarchical storage of data.
 * <br>
 * "user data" refers to the various media objects that can be created by users, such as
 * {@link MediaImage}s. MediaDirectories help to organize media files so that they can be
 * browsed and retrieved more easily and efficiently.
 * <br>
 * Objects such as {@link TextContent}s are not stored in MediaDirectories, only the Datastore
 * representation of assets that they use are.
 * <br>
 * Objects stored in MediaDirectories should not contain user data directly, as that would
 * be an inefficient use of the Datastore. Instead, they should store references to data
 * stored in GCS or Blob Storage, like the MediaImage class does.
 * 
 * @author Nicholas Utz
 */
public class MediaDirectory extends AbstractMediaEntry implements IStorable, ISupportAccessControls {

	private static final DatastoreService DSTORE = DatastoreServiceFactory.getDatastoreService();
	private static final MemcacheService CACHE = MemcacheServiceFactory.getMemcacheService();
	private static final AsyncMemcacheService ASYNC_CACHE = MemcacheServiceFactory.getAsyncMemcacheService();

	private static final Logger LOG = Logger.getLogger(MediaDirectory.class.getName());
	private static final Key ROOT_KEY = KeyFactory.createKey("datastore-root", "media-directory-root");
	
	/**
	 * Defines the list of kinds of {@link Entity}s which can only
	 * have a single layer media storage structure. Meaning that
	 * a MediaDirectory who's parent's kind is on this list,
	 * cannot contain sub-directories.
	 * <br>
	 * Currently, the only kind on this list is <code>blog-post</code>.
	 */
	private static final String SUBDIR_BLACKLIST = "blog-post;";
	
	/**
	 * Defines the kinds of {@link Entity}s that can be a parent of
	 * a MediaDirectory.<br>
	 * The list of acceptable parent entities is:
	 * <ul>
	 * 	<li><code>user</code> - as the root of a user's personal storage</li>
	 * 	<li><code>user-group</code> - as the root of the group's shared storage</li>
	 * 	<li><code>blog-post</code> - to hold assets used just in one post</li>
	 * 	<li><code>project</code> - as the root of the project's shared storage</li>
	 * 	<li><code>wiki</code> - as the root of the wiki's asset storage</li>
	 * 	<li><code>media-directory</code> - as a sub-directory</li>
	 * </ul>
	 */
	private static final String PARENT_WHITELIST = "blog-post;media-dir;user;project;user-group;wiki;";
	
	private Entity ent;
	
	/**
	 * Creates a new MediaDirectory, based off of the given {@link Entity}.
	 * 
	 * @param ent Entity from which to create the MediaDirectory
	 */
	public MediaDirectory(Entity ent) {
		if (!ent.getKind().equals("media-dir")) throw new IllegalArgumentException("The given Entity is of the wrong kind");
		this.ent = ent;
		ASYNC_CACHE.put("media-dir:" + ent.getKey().getId(), ent, Expiration.byDeltaSeconds(3600 * 6));
	}
	
	/**
	 * Creates a new MediaDirectory, based off of the {@link Entity} retrieved using the given
	 * {@link Key}.
	 * @param key the Key used to retrieve the Entity used to build the MediaDirectory
	 */
	public MediaDirectory(Key key) throws EntityNotFoundException {
		if (!key.getKind().equals("media-dir")) {
			throw new IllegalArgumentException("Cannot create MediaDirectory from non-media-directory Key");
		}
		
		String cacheKey = "media-dir:" + key.getId();
		
		if (CACHE.contains(cacheKey)) {
			this.ent = (Entity) CACHE.get(cacheKey);
			
		} else {
			this.ent = DSTORE.get(key);
		}
	}
	
	/**
	 * Creates a new MediaDirectory with the given name and parent.
	 * <br>
	 * Note that MediaDirectories created in this manner are not automatically
	 * persisted, and must have their {@link #storeDatastore()} or 
	 * {@link #storeDatastore(DatastoreService, Transaction)} methods called
	 * manually.
	 * 
	 * @param name the name of the new directory
	 * @param parent the parent of the new directory
	 */
	public MediaDirectory(String name, Entity parent) {
		if (!PARENT_WHITELIST.contains(parent.getKind())) {
			throw new IllegalArgumentException("MediaDirectory cannot be child of a " + parent.getKind());
		}
		
		this.ent = new Entity("media-dir", ROOT_KEY);
		ent.setProperty("media-dir-parent", parent.getKey().getId());
		ent.setProperty("media-dir-name", name);
		
		if (parent.getKind().equals("media-dir")) {
			MediaDirectory parentDir = new MediaDirectory(parent);
			parentDir.addChildEntry(this);
		}
		
		if (parent.hasProperty("object-acl")) {
			ent.setUnindexedProperty("object-acl", parent.getProperty("object-acl"));
			
		} else {
			//create new ACL with default values
			
			/* 
			 * TODO:
			 * 
			 * Figure out how to figure out the ID of the user making current request while being thead-safe?
			 * Given the parent whitelist filter, there should never be a MediaDirectory created with a parent that doesn't
			 * have the "object-acl" property.
			 */
			
			//or just throw an exception?
			
			AccessControlList acl = new AccessControlList(KeyFactory.createKey("user", "???"));//TODO:figure out current user's ID
			
			acl.storeDatastore();
			ent.setUnindexedProperty("object-acl", acl.getDatastoreKey());
		}
		
		storeDatastore();
	}
	
	/**
	 * Returns the name of this MediaDirectory.
	 * @return directory's name
	 */
	public String getName() {
		return (String) ent.getProperty("media-dir-name");
	}
	
	/**
	 * Returns the {@link Key} of the Entity representing this MediaDirectory in the datastore.
	 * 
	 * @return MediaDirectory's Entity's Key
	 */
	@Override
	public Key getDatastoreKey() {
		return ent.getKey();
	}
	
	/**
	 * Returns the {@link Key} of the datastore Entity representing the parent of this
	 * MediaDirectory.
	 * <br>
	 * Note that the parent may be another MediaDirectory, a post, page, wiki, project,
	 * user, or anything else that can be parent to a MediaDirectory.
	 * 
	 * @return parent's key.
	 */
	public Key getParentKey() {
		return (Key) ent.getProperty("media-dir-parent");
	}
	
	/**
	 * Determines whether this MediaDirectory supports the creation of sub-directories.
	 * 
	 * @return supports sub-dirs
	 */
	public boolean supportsSubDirectories() {
		if (SUBDIR_BLACKLIST.contains(getParentKey().getKind())) {
			return false;
		}
		
		return true;
	}
	
	/**
	 * Called to add the given {@link AbstractMediantry} to this MediaDirectory's list of child entries.
	 * @param child the child to add
	 */
	public void addChildEntry(AbstractMediaEntry child) {
		if (child.getType() == AbstractMediaEntry.MEDIA_TYPE_DIRECTORY && !this.supportsSubDirectories()) {
			throw new IllegalArgumentException("This media-directory does not support the creation of sub-directories");
		}
		
		Key childKey = child.getDatastoreKey();
		List<Key> children = listChildKeys();
		children.add(childKey);
		ent.setProperty("media-dir-children", children);
		
		storeDatastore();
	}
	
	/**
	 * Removes the given {@link AbstractMediaEntry} from this MediaDirectory's list
	 * of child entrys.
	 * @param child the child to remove
	 */
	public void removeChildEntry(AbstractMediaEntry child) {
		removeChildEntry(child.getDatastoreKey());
	}
	
	/**
	 * Removes the given {@link Key} from this MediaDirectory's list of
	 * child entry keys.
	 * @param child the child key to remove
	 */
	public void removeChildEntry(Key child) {
		List<Key> children = listChildKeys();
		children.remove(child);
		ent.setProperty("media-dir-children", children);
		storeDatastore();
	}
	
	/**
	 * Returns a List containing references to all of the {@link AbstractMediaEntry}s that are considered
	 * children of this MediaDirectory.
	 * <br>
	 * The returned list may be empty, if there are no children, or if there was an error in
	 * retrieving them from the datastore.
	 * 
	 * @return list of children
	 */
	@SuppressWarnings("unchecked")
	public List<AbstractMediaEntry> listChildren() {
		if (!ent.hasProperty("media-dir-children")) new ArrayList<AbstractMediaEntry>();
		List<Key> keys = (ArrayList<Key>) ent.getProperty("media-dir-children");
		ArrayList<AbstractMediaEntry> chilren = new ArrayList<AbstractMediaEntry>();
		
		for (Key k : keys) {
			try {
				chilren.add(AbstractMediaEntry.fromKey(k));
				
			} catch (EntityNotFoundException e) {
				LOG.log(Level.WARNING, "MediaDirectory storing reference to non-existant child", e);
			}
		}
		
		return chilren;
	}
	
	/**
	 * Returns a List containing the {@link Key}s of all of the {@link AbstractMediaEntry}s that are
	 * children of this MediaDirectory.
	 * @return list of children's keys
	 */
	@SuppressWarnings("unchecked")
	public List<Key> listChildKeys() {
		if (ent.hasProperty("media-dir-children")) return (List<Key>) ent.getProperty("media-dir-children");
		return new ArrayList<Key>();
	}
	
	@Override
	public void delete() {
		Transaction txn = DSTORE.beginTransaction();
		
		try {
			DSTORE.delete(txn, this.ent.getKey());
			txn.commit();
			
		} catch (DatastoreFailureException e) {
			LOG.log(Level.WARNING, "Unable to delete MediaDirectory", e);
			if (txn.isActive()) txn.rollback();
		}
		
		CACHE.delete("media-dir:" + ent.getKey().getId());
	}
	
	@Override
	public void storeDatastore(DatastoreService datastore, Transaction trx) throws DatastoreFailureException {
		datastore.put(ent);
		ASYNC_CACHE.put("media-dir:" + ent.getKey().getId(), ent, Expiration.byDeltaSeconds(3600 * 6));
	}

	@Override
	public void fetchDatastore(DatastoreService datastore, Transaction trx) throws EntityNotFoundException {
		this.ent = datastore.get(trx, ent.getKey());
		ASYNC_CACHE.put("media-dir:" + ent.getKey().getId(), ent);
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

	@Override
	public int getType() {
		return AbstractMediaEntry.MEDIA_TYPE_DIRECTORY;
	}

	@Override
	public Key getAclKey() {
		return (Key) ent.getProperty("object-acl");
	}

}
class DirectoryCleanupTask implements DeferredTask {
	private static final long serialVersionUID = 4875692452883392180L;
	
	private static final MemcacheService CACHE = MemcacheServiceFactory.getMemcacheService();
	private static final AsyncMemcacheService ASYNC_CACHE = MemcacheServiceFactory.getAsyncMemcacheService();
	private static final DatastoreService D_STORE = DatastoreServiceFactory.getDatastoreService();
	private static final Logger LOG = Logger.getLogger(DirectoryCleanupTask.class.getName());
	
	private Key toClean;
	
	public DirectoryCleanupTask(Key dirToClean) {
		this.toClean = dirToClean;
		
		Queue q = QueueFactory.getDefaultQueue();
		q.add(TaskOptions.Builder.withPayload(this).countdownMillis(100));
	}
	
	@Override
	public void run() {
		Entity ent = null;
		Transaction trx = D_STORE.beginTransaction();

		if (CACHE.contains(toClean)) {
			ent = (Entity) CACHE.get(toClean);
			
		} else {
			try {
				ent = D_STORE.get(trx, toClean);
				trx.commit();
				
			} catch (EntityNotFoundException e) {
				LOG.log(Level.WARNING, "DirectoryCleanupTask unable to fetch directory to be cleaned up", e);
				if (trx.isActive()) trx.rollback();
				return;
			}
		}
		
		
		if (ent.hasProperty("media-dir-children")) {
			@SuppressWarnings("unchecked")
			List<Key> children = (ArrayList<Key>) ent.getProperty("media-dir-children");
			
			for (Key k : children) {
				try {
					D_STORE.get(k);
					//TODO: cache retrived entity
				} catch (EntityNotFoundException e) {
					children.remove(k);
				}
			}
			
			ent.setProperty("media-dir-children", children);
			
			try {
				D_STORE.put(ent);
				
			} catch (DatastoreFailureException e) {
				LOG.log(Level.WARNING, "DirectoryCleanup unable to put cleaned directory", e);
			}

			ASYNC_CACHE.put("media-dir:" + toClean.getId(), ent, Expiration.byDeltaSeconds(3600 * 6));
			
		} else {
			//do nothing
		}
	}
}