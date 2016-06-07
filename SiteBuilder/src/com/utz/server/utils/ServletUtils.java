package com.utz.server.utils;

import java.util.regex.Pattern;

public class ServletUtils {
	public static final String QSTRING_REGEX = "\\&?([a-zA-Z]+)\\=([a-zA-Z]+)";
	public static final Pattern QSTRING_PATTERN = Pattern.compile(QSTRING_REGEX);
}
