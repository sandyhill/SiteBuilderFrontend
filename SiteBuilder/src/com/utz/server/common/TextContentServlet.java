package com.utz.server.common;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.Key;
import com.utz.core.common.TextContent;

public class TextContentServlet extends HttpServlet {
	private static final long serialVersionUID = 3698172195541761398L;
	
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp) {
		
	}
	
	@Override
	public void doHead(HttpServletRequest req, HttpServletResponse resp) {
		
	}
	
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse resp) {
		
	}
	
	public static Key textContentKeyFromMetaURL(String metaURL) {
		return null;
	}
}
