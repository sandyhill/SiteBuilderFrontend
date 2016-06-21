package com.utz.core.common;

import com.google.appengine.api.datastore.DatastoreFailureException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Transaction;
import com.utz.core.storage.IStorable;
import com.utz.core.users.AccessControlList;
import com.utz.core.users.ISupportAccessControls;

public class Page implements IStorable, ISupportAccessControls {

	@Override
	public Key getAclKey() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Key getDatastoreKey() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void storeDatastore(DatastoreService datastore, Transaction trx)
			throws DatastoreFailureException {
		// TODO Auto-generated method stub

	}

	@Override
	public void fetchDatastore(DatastoreService datastore, Transaction trx)
			throws EntityNotFoundException {
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

}
