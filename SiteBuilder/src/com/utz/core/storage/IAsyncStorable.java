package com.utz.core.storage;

import com.google.appengine.api.datastore.AsyncDatastoreService;
import com.google.appengine.api.datastore.Transaction;

/**
 * Defines the interface for objects that can be asynchronously stored in
 * the Google Cloud Datastore.
 * 
 * @author Nicholas Utz 
 */
public interface IAsyncStorable extends IStorable {
	
	/**
	 * Initiates the asynchronous storage of this IAsyncStorable in the Datastore.
	 * 
	 * IStorables may also use this method to call the {@link AsyncMemcacheService},
	 * but that is not required.
	 */
	public void beginStoreDatastore();
	
	/**
	 * Initiates the asynchronous storage of this IAsyncStorable in the Datastore,
	 * using the given {@link AsyncDatastoreService}, in the context of the given
	 * {@link Transaction}.
	 * 
	 * IStorables may also use this method to call the {@link AsyncMemcacheService},
	 * but that is not required.
	 * 
	 * @param datastore the AsyncDatastoreService to use to store this IAsyncStorable
	 * @param trx a Transaction in which to store the IAsyncStorable
	 */
	public void beginStoreDatastore(AsyncDatastoreService datastore, Transaction trx);

}
