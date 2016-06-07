package com.utz.core.storage;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collection;
import java.util.logging.Logger;
import java.util.logging.Level;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.storage.Storage;
import com.google.api.services.storage.StorageScopes;
import com.google.appengine.api.appidentity.AppIdentityService;
import com.google.appengine.api.appidentity.AppIdentityServiceFactory;

/**
 * Convenience class for creating instances of the {@link Storage} Service class.
 * 
 * @author Nicholas Utz
 */
public class StorageFactory {

	private static final AppIdentityService APP_IDENTITY = AppIdentityServiceFactory.getAppIdentityService();
	private static final Logger LOG = Logger.getLogger(StorageFactory.class.getName());

	private static Storage instance = null;
	
	/**
	 * Returns an instance of {@link Storage}.
	 * 
	 * @return GCS Storage instance
	 */
	public static synchronized Storage getStorage() {
		if (instance == null) {
			try {
				instance = buildStorage();
				
			} catch (IOException e) {
				LOG.log(Level.SEVERE, "IOException while trying to create GCS Service", e);
				
			} catch (GeneralSecurityException e) {
				LOG.log(Level.SEVERE, "GeneralSecurityException while trying to create GCS Service", e);
			}
		}
		
		return instance;
	}
	
	/**
	 * Used internally to build an instance of the GCS {@link Storage} service.
	 * 
	 * @return a new Storage
	 * @throws IOException an IOException occurs while trying to create a Storage
	 * @throws GeneralSecurityException a GeneralSecurityException occurs while trying to create a Storage
	 */
	private static synchronized Storage buildStorage() throws IOException, GeneralSecurityException {
		  HttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
		  JsonFactory jsonFactory = new JacksonFactory();
		  GoogleCredential credential = GoogleCredential.getApplicationDefault(transport, jsonFactory);

		  if (credential.createScopedRequired()) {
		    Collection<String> bigqueryScopes = StorageScopes.all();
		    credential = credential.createScoped(bigqueryScopes);
		  }
		  
		  return new Storage.Builder(transport, jsonFactory, credential)
		      .setApplicationName(APP_IDENTITY.getServiceAccountName())
		      .build();
	}
	
	public static String getDefaultBucketName() {
		return APP_IDENTITY.getDefaultGcsBucketName();
	}
}
