package com.mozilla.greetings;

public class RustGreetings {
    static {
        System.loadLibrary("planet");
    }
    private static native String greeting(final String pattern);
    public static native void serve();

    public String sayHello(String to) {
        return greeting(to);
    }
}