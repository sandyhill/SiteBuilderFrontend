package com.utz.core.media;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.utz.core.storage.IStorable;
import com.utz.core.users.ISupportAccessControls;

public abstract class AbstractMediaEntry implements IStorable, ISupportAccessControls {
	
	/**
	 * Creates an AbstractMediaEntry from the given {@link Entity}.
	 * The kind of the given entity is used to determine which sub-class
	 * of AbstractMediaEntry to create.
	 * @param ent the entity to create a media entry from
	 * @return an AbstractMediaEntry made from the given Entity
	 */
	public static AbstractMediaEntry fromEntity(Entity ent) {
		String kind = ent.getKind();
		
		if (kind.equals("media-dir")) {
			return new MediaDirectory(ent);
			
		} else if (kind.equals("media-image")) {
			return new MediaImage(ent);
			
		} else {
			throw new IllegalArgumentException("The given Entity is not of a recognized media- kind");
		}
	}

	/**
	 * Creates an AbstractMediaEntry from the given {@link Key}.
	 * The kind of the given key is used to determine which sub-class
	 * of AbstractMediaEntry to create.
	 * @param ent the key to create a media entry from
	 * @return an AbstractMediaEntry made from the given Key
	 * @throws EntityNotFoundException there was no Datastore Entity with the given Key
	 */
	public static AbstractMediaEntry fromKey(Key key) throws EntityNotFoundException {
		String kind = key.getKind();
		
		if (kind.equals("media-dir")) {
			return new MediaDirectory(key);
			
		} else if (kind.equals("media-image")) {
			return new MediaImage(key);
			
		} else {
			throw new IllegalArgumentException("The given Entity is not of a recognized media- kind");
		}
	}
	
	/**
	 * Returns the type identifier of this AbstractMediaEntry.
	 * @return media type
	 */
	public abstract int getType();
	
	/**
	 * Removes the AbstractMediaEntry from the datastore.
	 */
	public abstract void delete();
	
	/**
	 * A media type identifier indicating that this AbstractMediaEntry
	 * is a media directory.
	 */
	public static final int MEDIA_TYPE_DIRECTORY = 	0x01;
	
	/**
	 * A media type identifier indicating that this AbstractMediaEntry
	 * is an image.
	 */
	public static final int MEDIA_TYPE_IMAGE = 		0x02;
	
	/**
	 * A media type identifier indicating that this AbstractMediaEntry
	 * is a video file.
	 */
	public static final int MEDIA_TYPE_VIDEO = 		0x03;
	
	/**
	 * A media type identifier indicating that this AbstractMediaEntry
	 * is an audio file.
	 */
	public static final int MEDIA_TYPE_AUDIO = 		0x04;
	
	/**
	 * A media type identifier indicating that this AbstractMediaEntry
	 * is some other type of data.
	 */
	public static final int MEDIA_TYPE_DOCUMENT = 	0x05;
}
