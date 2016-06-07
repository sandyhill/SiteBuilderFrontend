package com.utz.core.storage;

import com.google.appengine.api.datastore.DatastoreFailureException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Transaction;

/**
 * Defines the interface of objects that can be stored and retrieved from the
 * Google Cloud Datastore.
 * 
 * @author Nicholas Utz
 */
//TODO: handle (propagate then handle) datastore-related exceptions ;_; 
public interface IStorable {
	
	/**
	 * Returns the {@link Key} of this IStorable.
	 * 
	 * @return datastore key
	 */
	public Key getDatastoreKey();
	
	/**
	 * Stores the fields of this IStorable in the Datastore.
	 * <br>
	 * It is up to the implementing class to keep track of whether it was created
	 * from an existing Datastore Entity and to update that Entity accordingly.
	 * <br>
	 * The implementing class may also store data in the Memcache in this function.
	 * 
	 * @param datastore the {@link DatastoreService} to use to store the IStorable
	 * @param trx a {@link Transaction} to use when storing the IStorable
	 * @throws DatastoreFailureException there was a problem writing to the Datastore
	 */
	public void storeDatastore(DatastoreService datastore, Transaction trx) throws DatastoreFailureException;
	
	/**
	 * Retrieves the latest version of this IStorable from the Datastore.
	 * <br>
	 * This method can be used to complete the fetching of objects retrieved
	 * via Projection Queries, or to make sure that an object has the latest
	 * values stored in the Datastore.
	 * <br>
	 * The implementing class may also store data in the Memcache in this function.
	 * 
	 * @param datastore the {@link DatastoreService} to use to fetch this IStorable's Datastore Entity
	 * @param trx a {@link Transaction} to use when fetching the Entity
	 * @throws EntityNotFoundException the Entity storing this IStorable is not found in the Datastore
	 */
	public void fetchDatastore(DatastoreService datastore, Transaction trx) throws EntityNotFoundException;
	
	/**
	 * Stores the fields of this IStorable in the Datastore.
	 * <br>
	 * Use {@link #storeDatastore(DatastoreService, Transaction)} to store the IStorable in a Transaction.
	 * <br>
	 * It is up to the implementing class to keep track of whether it was created
	 * from an existing Datastore Entity and to update that Entity accordingly.
	 * @throws DatastoreFailureException there was a problem writing to the Datastore
	 */
	public void storeDatastore() throws DatastoreFailureException;

	/**
	 * Retrieves the latest version of this IStorable from the Datastore.
	 * <br>
	 * Use {@link #fetchDatastore(DatastoreService, Transaction)} to fetch the IStorable in a Transaction.
	 * <br>
	 * This method can be used to complete the fetching of objects retrieved
	 * via Projection Queries, or to make sure that an object has the latest
	 * values stored in the Datastore.
	 * 
	 * @param datastore the {@link DatastoreService} to use to fetch this IStorable's Datastore Entity
	 * @param trx a {@link Transaction} to use when fetching the Entity
	 * @throws EntityNotFoundException the Entity storing this IStorable is not found in the Datastore
	 */
	public void fetchDatastore() throws EntityNotFoundException;
}
