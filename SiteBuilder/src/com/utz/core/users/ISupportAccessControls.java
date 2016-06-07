package com.utz.core.users;

import com.google.appengine.api.datastore.Key;

public interface ISupportAccessControls {
	public AccessControlList getACL();
	
	public Key getAclKey();
}
