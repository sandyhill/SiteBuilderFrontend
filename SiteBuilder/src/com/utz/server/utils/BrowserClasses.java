package com.utz.server.utils;

public enum BrowserClasses {
	MOBILE, TABLET, DESKTOP;
	
	public static BrowserClasses classForWidth(int width) {
		if (width <= 600) {
			return MOBILE;
			
		} else if (width <= 992) {
			return TABLET;
			
		} else {
			//if (width > 992)
			return DESKTOP;
		}
	}
}
