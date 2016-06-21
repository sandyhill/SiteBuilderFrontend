package com.utz.core.media;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.DatastoreFailureException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Link;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.images.ImagesService;
import com.google.appengine.api.images.ImagesServiceFactory;
import com.google.appengine.api.images.ServingUrlOptions;
import com.google.appengine.api.memcache.AsyncMemcacheService;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.utz.core.storage.StorageFactory;
import com.utz.core.users.AccessControlList;

public class MediaImage extends AbstractMediaEntry {

	private static final DatastoreService DSTORE = DatastoreServiceFactory.getDatastoreService();
	private static final MemcacheService CACHE = MemcacheServiceFactory.getMemcacheService();
	private static final AsyncMemcacheService ASYNC_CACHE = MemcacheServiceFactory.getAsyncMemcacheService();
	private static final ImagesService IMAGES = ImagesServiceFactory.getImagesService();

	private static final Key ROOT_KEY = KeyFactory.createKey("datastore-root", "media-image-root");
	private static final Logger LOG = Logger.getLogger(MediaImage.class.getName());
	
	public static final int IMAGE_PORTRAIT = 	0x0100;
	public static final int IMAGE_9X16 = 		0x0101;
	public static final int IMAGE_3X4 = 		0x0102;
	public static final int IMAGE_LANDSCAPE =	0x0200;
	public static final int IMAGE_16X9 = 		0x0201;
	public static final int IMAGE_4X3 = 		0x0202;
	public static final int IMAGE_SQUARE =		0x0300;
	
	private Entity ent;
	
	/**
	 * Creates a new MediaImage from the given Entity.
	 * @param ent the entity from which to create a MediaImage
	 */
	public MediaImage(Entity ent) {
		if (!ent.getKind().equals("media-image")) throw new IllegalArgumentException("The given Entity is of the wrong kind");
		this.ent = ent;
		ASYNC_CACHE.put("media-img:" + ent.getKey().getId(), ent, Expiration.byDeltaSeconds(3600 * 12));
	}
	
	public MediaImage(String GCSName, MediaDirectory parent, String title, int shape) {
		this.ent = new Entity("media-image", ROOT_KEY);
		ent.setProperty("media-image-name", title);
		ent.setProperty("media-image-parent", parent.getDatastoreKey());
		ent.setProperty("media-image-object-name", GCSName);
		ent.setProperty("media-image-shape", shape);
		
		String servingURL = IMAGES.getServingUrl(ServingUrlOptions.Builder.withGoogleStorageFileName("/gs/" + StorageFactory.getDefaultBucketName() + "/" + GCSName));
		
		ent.setProperty("media-image-serving-url", servingURL);

		storeDatastore();
		
		parent.addChildEntry(this);

		ASYNC_CACHE.put("media-img:" + ent.getKey().getId(), ent, Expiration.byDeltaSeconds(3600 * 12));
	}
	
	/**
	 * Creates a new MediaImage from the {@link Entity} retrieved using the given
	 * {@link Key}.
	 * @param k the key to use to retrieve an entity from which to make the MediaImage
	 * @throws EntityNotFoundException there was no Entity found with the given key
	 */
	public MediaImage(Key k) throws EntityNotFoundException {
		if (!k.getKind().equals("media-image")) throw new IllegalArgumentException("The given Key is of the wrong kind");
		
		String sKey = "media-img:" + k.getId();
		if (CACHE.contains(sKey)) {
			this.ent = (Entity) CACHE.get(sKey);
			
		} else {
			this.ent = DSTORE.get(k);
			
		}
		ASYNC_CACHE.put(sKey, ent, Expiration.byDeltaSeconds(3600 * 12));
	}
	
	/**
	 * Returns the friendly name of this MediaImage.
	 * 
	 * @return image's name
	 */
	public String getName() {
		return (String) ent.getProperty("media-image-name");
	}
	
	/**
	 * Returns the name of the object storing the image represented by this MediaImage
	 * in Google Cloud Storage.
	 * 
	 * @return GCS object name
	 */
	public String getStorageObjectName() {
		return (String) ent.getProperty("media-image-object-name");
	}
	
	/**
	 * Returns the serving URL provided by the ImageService to serve this image.
	 * 
	 * @return image serving URL
	 */
	public String getServingUrl() {
		return ((Link) ent.getProperty("media-image-serving-url")).getValue();
	}

	/**
	 * Returns the web-safe string representation of this MediaImage's Datastore
	 * {@link Key} to be embedded in served web pages.
	 * @return
	 */
	public String getWebSafeKeyString() {
		return KeyFactory.keyToString(ent.getKey());
	}
	
	/**
	 * Returns an int representing the shape of the image
	 * represented by this MediaImage object.
	 * <br>
	 * The returned value will be equivalent to one of:
	 * <ul>
	 * <li>{@link #IMAGE_PORTRAIT}</li>
	 * <li>{@link #IMAGE_9X16}</li>
	 * <li>{@link #IMAGE_3X4}</li>
	 * <li>{@link #IMAGE_LANDSCAPE}</li>
	 * <li>{@link #IMAGE_16X9}</li>
	 * <li>{@link #IMAGE_4X3}</li>
	 * <li>{@link #IMAGE_SQUARE}</li>
	 * </ul>
	 * @return image shape code
	 */
	public int getImageShape() {
		return (int) ent.getProperty("media-image-shape");
	}
	
	/**
	 * Determines whether the image represented by this MediaImage is portrait,
	 * that is, taller than it is wider.
	 * @return is tall
	 */
	public boolean isPortrait() {
		return this.getImageShape() >= IMAGE_PORTRAIT && this.getImageShape() < IMAGE_LANDSCAPE;
	}

	/**
	 * Determines whether the image represented by this MediaImage is landscape,
	 * that is, wider than it is tall.
	 * @return is wide
	 */
	public boolean isLandscape() {
		return this.getImageShape() >= IMAGE_LANDSCAPE && this.getImageShape() < IMAGE_SQUARE;
	}

	/**
	 * Determines whether the image represented by this MediaImage is square,
	 * that is, equally tall and wide.
	 * @return is square
	 */
	public boolean isSquare() {
		return this.getImageShape() == IMAGE_SQUARE;
	}
	
	@Override
	public void delete() {
		
	}
	
	@Override
	public void storeDatastore(DatastoreService datastore, Transaction trx)
			throws DatastoreFailureException {
		DSTORE.put(trx, ent);
		ASYNC_CACHE.put("media-img:" + ent.getKey().getId(), ent, Expiration.byDeltaSeconds(3600 * 12));
	}

	@Override
	public void fetchDatastore(DatastoreService datastore, Transaction trx)
			throws EntityNotFoundException {
		String cacheKey = "media-img:" + ent.getKey().getId();
		
		if (CACHE.contains(cacheKey)) {
			this.ent = (Entity) CACHE.get(cacheKey);
			
		} else {
			this.ent = DSTORE.get(trx, ent.getKey());
		}
		
		ASYNC_CACHE.put(cacheKey, ent, Expiration.byDeltaSeconds(3600 * 12));
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
			if (trx.isActive()) trx.commit();
			throw e;
		}
	}

	@Override
	public int getType() {
		return AbstractMediaEntry.MEDIA_TYPE_IMAGE;
	}

	@Override
	public Key getDatastoreKey() {
		return this.ent.getKey();
	}

	@Override
	public Key getAclKey() {
		return (Key) ent.getProperty("object-acl");
	}

}
