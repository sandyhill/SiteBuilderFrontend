package com.utz.core.users;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Transaction;
import com.utz.core.storage.IStorable;

public class UserInfo implements IStorable {
	
	public long getUserId() {
		return 0;
	}
	
	@Override
	public void storeDatastore(DatastoreService datastore, Transaction trx) {
		
	}

	@Override
	public void fetchDatastore(DatastoreService datastore, Transaction trx) {
		
	}

	@Override
	public void storeDatastore() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void fetchDatastore() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Key getDatastoreKey() {
		// TODO Auto-generated method stub
		return null;
	}

}
