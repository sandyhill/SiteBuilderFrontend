package com.utz.core.users;

import com.google.appengine.api.datastore.Key;

public interface ISupportAccessControls {
	public Key getAclKey();
}
