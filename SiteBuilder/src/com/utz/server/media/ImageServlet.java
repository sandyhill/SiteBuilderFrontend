package com.utz.server.media;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.utz.core.media.MediaImage;
import com.utz.server.utils.BrowserClasses;
import com.utz.server.utils.ServletUtils;

/**
 * Uses the browser-width and browser-height cookies, along with the image-class
 * query string parameter to determine the optimized size to serve an image.
 * 
 * @author Nicholas Utz
 */
public class ImageServlet extends HttpServlet {
	private static final long serialVersionUID = -1259022113203362706L;

	private static final Logger LOG = Logger.getLogger(ImageServlet.class.getName());
	
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		Cookie[] cookies = req.getCookies();
		int width = 990;
		int height = 0;
		
		for (int i = 0; i < cookies.length; i++) {
			Cookie c = cookies[i];
			if (c.getName().equals("browser-width")) {
				try {
					width = (Integer.parseInt(c.getValue()));
					
				} catch (NumberFormatException e) {
					LOG.log(Level.INFO, "Unable to parse width: " + c.getValue(), e);
				}
				
			} else if (c.getName().equals("browser-height")) {
				try {
					height = (Integer.parseInt(c.getValue()));
					
				} catch (NumberFormatException e) {
					LOG.log(Level.INFO, "Unable to parse height: " + c.getValue(), e);
				}
				
			}
		}
		
		String query = req.getQueryString();
		Matcher matcher = ServletUtils.QSTRING_PATTERN.matcher(query);
		
		String imageClass = "CARD";
		String imageKey = "";
		
		while (matcher.find()) {
			String key = matcher.group(1);
			String value = matcher.group(2);
			
			if (key.equalsIgnoreCase("c")) {
				imageClass = value.toUpperCase();
				
			} else if (key.equalsIgnoreCase("k")) {
				imageKey = value;
			}
		}
		
		if (imageKey.equals("")) {
			resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		
		Key key = KeyFactory.stringToKey(imageKey);
		MediaImage image = null;
		
		try {
			image = new MediaImage(key);
			
		} catch (EntityNotFoundException e) {
			LOG.log(Level.WARNING, "Request for non-existant MediaImage", e);
		}
		
		String servingUrl = image.getServingUrl();
		
		ImageClasses imgClass = ImageClasses.valueOf(imageClass);
		BrowserClasses browserClass; 
		
		if (width > height) {
			browserClass = BrowserClasses.classForWidth(width);
			
		} else {
			browserClass = BrowserClasses.classForWidth(height);
		}
		
		if (imgClass == ImageClasses.THUMB) {
			resp.sendRedirect(servingUrl + "=s128");
			
		} else if (imgClass == ImageClasses.ICON) {
			resp.sendRedirect(servingUrl + "=s32");
			
		}else if (imgClass == ImageClasses.CARD) {
			if (browserClass == BrowserClasses.MOBILE) {
				if (image.isLandscape()) {
					resp.sendRedirect(servingUrl + "=s" + width);
					
				} else {
					resp.sendRedirect(servingUrl + "=s" + height);
				}
				
			} else if (browserClass == BrowserClasses.TABLET) {
				if (image.isLandscape()) {
					resp.sendRedirect(servingUrl + "=s" + width / 2);
					
				} else {
					resp.sendRedirect(servingUrl + "=s" + height / 2);
				}
				
			} else {
				if (image.isLandscape()) {
					resp.sendRedirect(servingUrl + "=s" + width / 3);
					
				} else {
					resp.sendRedirect(servingUrl + "=s" + height / 3);
				}
			}
			
		} else if (imgClass == ImageClasses.BANNER) {
			if (image.isLandscape()) {
				resp.sendRedirect(servingUrl + "=s" + width);
				
			} else {
				resp.sendRedirect(servingUrl + "=s" + height);
			}
			
		} else if (imgClass == ImageClasses.GALLERY) {
			if (browserClass == BrowserClasses.MOBILE) {
				if (image.isLandscape()) {
					resp.sendRedirect(servingUrl + "=s" + width);
					
				} else {
					resp.sendRedirect(servingUrl + "=s" + height);
				}
				
			} else if (browserClass == BrowserClasses.TABLET) {
				if (image.isLandscape()) {
					resp.sendRedirect(servingUrl + "=s" + width);
					
				} else {
					resp.sendRedirect(servingUrl + "=s" + (height * 3/4));
				}
				
			} else {
				if (image.isLandscape()) {
					resp.sendRedirect(servingUrl + "=s" + width);
					
				} else {
					resp.sendRedirect(servingUrl + "=s" + height);
				}
				
			}
		}
		
		resp.sendRedirect(servingUrl);
	}
}
