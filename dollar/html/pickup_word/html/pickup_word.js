"use strict";

if( typeof Rust === "undefined" ) {
    var Rust = {};
}

(function( root, factory ) {
    if( typeof define === "function" && define.amd ) {
        define( [], factory );
    } else if( typeof module === "object" && module.exports ) {
        module.exports = factory();
    } else {
        Rust.pickup_word = factory();
    }
}( this, function() {
    return (function( module_factory ) {
        var instance = module_factory();

        if( typeof window === "undefined" && typeof process === "object" ) {
            var fs = require( "fs" );
            var path = require( "path" );
            var wasm_path = path.join( __dirname, "pickup_word.wasm" );
            var buffer = fs.readFileSync( wasm_path );
            var mod = new WebAssembly.Module( buffer );
            var wasm_instance = new WebAssembly.Instance( mod, instance.imports );
            return instance.initialize( wasm_instance );
        } else {
            return fetch( "pickup_word.wasm", {credentials: "same-origin"} )
                .then( function( response ) { return response.arrayBuffer(); } )
                .then( function( bytes ) { return WebAssembly.compile( bytes ); } )
                .then( function( mod ) { return WebAssembly.instantiate( mod, instance.imports ) } )
                .then( function( wasm_instance ) {
                    var exports = instance.initialize( wasm_instance );
                    console.log( "Finished loading Rust wasm module 'pickup_word'" );
                    return exports;
                })
                .catch( function( error ) {
                    console.log( "Error loading Rust wasm module 'pickup_word':", error );
                    throw error;
                });
        }
    }( function() {
    var Module = {};

    Module.STDWEB_PRIVATE = {};

// This is based on code from Emscripten's preamble.js.
Module.STDWEB_PRIVATE.to_utf8 = function to_utf8( str, addr ) {
    for( var i = 0; i < str.length; ++i ) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
        var u = str.charCodeAt( i ); // possibly a lead surrogate
        if( u >= 0xD800 && u <= 0xDFFF ) {
            u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt( ++i ) & 0x3FF);
        }

        if( u <= 0x7F ) {
            HEAPU8[ addr++ ] = u;
        } else if( u <= 0x7FF ) {
            HEAPU8[ addr++ ] = 0xC0 | (u >> 6);
            HEAPU8[ addr++ ] = 0x80 | (u & 63);
        } else if( u <= 0xFFFF ) {
            HEAPU8[ addr++ ] = 0xE0 | (u >> 12);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 6) & 63);
            HEAPU8[ addr++ ] = 0x80 | (u & 63);
        } else if( u <= 0x1FFFFF ) {
            HEAPU8[ addr++ ] = 0xF0 | (u >> 18);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 12) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 6) & 63);
            HEAPU8[ addr++ ] = 0x80 | (u & 63);
        } else if( u <= 0x3FFFFFF ) {
            HEAPU8[ addr++ ] = 0xF8 | (u >> 24);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 18) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 12) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 6) & 63);
            HEAPU8[ addr++ ] = 0x80 | (u & 63);
        } else {
            HEAPU8[ addr++ ] = 0xFC | (u >> 30);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 24) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 18) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 12) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 6) & 63);
            HEAPU8[ addr++ ] = 0x80 | (u & 63);
        }
    }
};

Module.STDWEB_PRIVATE.noop = function() {};
Module.STDWEB_PRIVATE.to_js = function to_js( address ) {
    var kind = HEAPU8[ address + 12 ];
    if( kind === 0 ) {
        return undefined;
    } else if( kind === 1 ) {
        return null;
    } else if( kind === 2 ) {
        return HEAP32[ address / 4 ];
    } else if( kind === 3 ) {
        return HEAPF64[ address / 8 ];
    } else if( kind === 4 ) {
        var pointer = HEAPU32[ address / 4 ];
        var length = HEAPU32[ (address + 4) / 4 ];
        return Module.STDWEB_PRIVATE.to_js_string( pointer, length );
    } else if( kind === 5 ) {
        return false;
    } else if( kind === 6 ) {
        return true;
    } else if( kind === 7 ) {
        var pointer = Module.STDWEB_PRIVATE.arena + HEAPU32[ address / 4 ];
        var length = HEAPU32[ (address + 4) / 4 ];
        var output = [];
        for( var i = 0; i < length; ++i ) {
            output.push( Module.STDWEB_PRIVATE.to_js( pointer + i * 16 ) );
        }
        return output;
    } else if( kind === 8 ) {
        var arena = Module.STDWEB_PRIVATE.arena;
        var value_array_pointer = arena + HEAPU32[ address / 4 ];
        var length = HEAPU32[ (address + 4) / 4 ];
        var key_array_pointer = arena + HEAPU32[ (address + 8) / 4 ];
        var output = {};
        for( var i = 0; i < length; ++i ) {
            var key_pointer = HEAPU32[ (key_array_pointer + i * 8) / 4 ];
            var key_length = HEAPU32[ (key_array_pointer + 4 + i * 8) / 4 ];
            var key = Module.STDWEB_PRIVATE.to_js_string( key_pointer, key_length );
            var value = Module.STDWEB_PRIVATE.to_js( value_array_pointer + i * 16 );
            output[ key ] = value;
        }
        return output;
    } else if( kind === 9 ) {
        return Module.STDWEB_PRIVATE.acquire_js_reference( HEAP32[ address / 4 ] );
    } else if( kind === 10 ) {
        var adapter_pointer = HEAPU32[ address / 4 ];
        var pointer = HEAPU32[ (address + 4) / 4 ];
        var deallocator_pointer = HEAPU32[ (address + 8) / 4 ];
        var output = function() {
            if( pointer === 0 ) {
                throw new ReferenceError( "Already dropped Rust function called!" );
            }

            var args = Module.STDWEB_PRIVATE.alloc( 16 );
            Module.STDWEB_PRIVATE.serialize_array( args, arguments );
            Module.STDWEB_PRIVATE.dyncall( "vii", adapter_pointer, [pointer, args] );
            var result = Module.STDWEB_PRIVATE.tmp;
            Module.STDWEB_PRIVATE.tmp = null;

            return result;
        };

        output.drop = function() {
            output.drop = Module.STDWEB_PRIVATE.noop;
            var function_pointer = pointer;
            pointer = 0;

            Module.STDWEB_PRIVATE.dyncall( "vi", deallocator_pointer, [function_pointer] );
        };

        return output;
    } else if( kind === 13 ) {
        var adapter_pointer = HEAPU32[ address / 4 ];
        var pointer = HEAPU32[ (address + 4) / 4 ];
        var deallocator_pointer = HEAPU32[ (address + 8) / 4 ];
        var output = function() {
            if( pointer === 0 ) {
                throw new ReferenceError( "Already called or dropped FnOnce function called!" );
            }

            output.drop = Module.STDWEB_PRIVATE.noop;
            var function_pointer = pointer;
            pointer = 0;

            var args = Module.STDWEB_PRIVATE.alloc( 16 );
            Module.STDWEB_PRIVATE.serialize_array( args, arguments );
            Module.STDWEB_PRIVATE.dyncall( "vii", adapter_pointer, [function_pointer, args] );
            var result = Module.STDWEB_PRIVATE.tmp;
            Module.STDWEB_PRIVATE.tmp = null;

            return result;
        };

        output.drop = function() {
            output.drop = Module.STDWEB_PRIVATE.noop;
            var function_pointer = pointer;
            pointer = 0;

            Module.STDWEB_PRIVATE.dyncall( "vi", deallocator_pointer, [function_pointer] );
        };

        return output;
    } else if( kind === 14 ) {
        var pointer = HEAPU32[ address / 4 ];
        var length = HEAPU32[ (address + 4) / 4 ];
        var array_kind = HEAPU32[ (address + 8) / 4 ];
        var pointer_end = pointer + length;

        switch( array_kind ) {
            case 0:
                return HEAPU8.subarray( pointer, pointer_end );
            case 1:
                return HEAP8.subarray( pointer, pointer_end );
            case 2:
                return HEAPU16.subarray( pointer, pointer_end );
            case 3:
                return HEAP16.subarray( pointer, pointer_end );
            case 4:
                return HEAPU32.subarray( pointer, pointer_end );
            case 5:
                return HEAP32.subarray( pointer, pointer_end );
            case 6:
                return HEAPF32.subarray( pointer, pointer_end );
            case 7:
                return HEAPF64.subarray( pointer, pointer_end );
        }
    } else if( kind === 15 ) {
        return Module.STDWEB_PRIVATE.get_raw_value( HEAPU32[ address / 4 ] );
    }
};

Module.STDWEB_PRIVATE.serialize_object = function serialize_object( address, value ) {
    var keys = Object.keys( value );
    var length = keys.length;
    var key_array_pointer = Module.STDWEB_PRIVATE.alloc( length * 8 );
    var value_array_pointer = Module.STDWEB_PRIVATE.alloc( length * 16 );
    HEAPU8[ address + 12 ] = 8;
    HEAPU32[ address / 4 ] = value_array_pointer;
    HEAPU32[ (address + 4) / 4 ] = length;
    HEAPU32[ (address + 8) / 4 ] = key_array_pointer;
    for( var i = 0; i < length; ++i ) {
        var key = keys[ i ];
        var key_length = Module.STDWEB_PRIVATE.utf8_len( key );
        var key_pointer = Module.STDWEB_PRIVATE.alloc( key_length );
        Module.STDWEB_PRIVATE.to_utf8( key, key_pointer );

        var key_address = key_array_pointer + i * 8;
        HEAPU32[ key_address / 4 ] = key_pointer;
        HEAPU32[ (key_address + 4) / 4 ] = key_length;

        Module.STDWEB_PRIVATE.from_js( value_array_pointer + i * 16, value[ key ] );
    }
};

Module.STDWEB_PRIVATE.serialize_array = function serialize_array( address, value ) {
    var length = value.length;
    var pointer = Module.STDWEB_PRIVATE.alloc( length * 16 );
    HEAPU8[ address + 12 ] = 7;
    HEAPU32[ address / 4 ] = pointer;
    HEAPU32[ (address + 4) / 4 ] = length;
    for( var i = 0; i < length; ++i ) {
        Module.STDWEB_PRIVATE.from_js( pointer + i * 16, value[ i ] );
    }
};

Module.STDWEB_PRIVATE.from_js = function from_js( address, value ) {
    var kind = Object.prototype.toString.call( value );
    if( kind === "[object String]" ) {
        var length = Module.STDWEB_PRIVATE.utf8_len( value );
        var pointer = 0;
        if( length > 0 ) {
            pointer = Module.STDWEB_PRIVATE.alloc( length );
            Module.STDWEB_PRIVATE.to_utf8( value, pointer );
        }
        HEAPU8[ address + 12 ] = 4;
        HEAPU32[ address / 4 ] = pointer;
        HEAPU32[ (address + 4) / 4 ] = length;
    } else if( kind === "[object Number]" ) {
        if( value === (value|0) ) {
            HEAPU8[ address + 12 ] = 2;
            HEAP32[ address / 4 ] = value;
        } else {
            HEAPU8[ address + 12 ] = 3;
            HEAPF64[ address / 8 ] = value;
        }
    } else if( value === null ) {
        HEAPU8[ address + 12 ] = 1;
    } else if( value === undefined ) {
        HEAPU8[ address + 12 ] = 0;
    } else if( value === false ) {
        HEAPU8[ address + 12 ] = 5;
    } else if( value === true ) {
        HEAPU8[ address + 12 ] = 6;
    } else if( kind === "[object Symbol]" ) {
        var id = Module.STDWEB_PRIVATE.register_raw_value( value );
        HEAPU8[ address + 12 ] = 15;
        HEAP32[ address / 4 ] = id;
    } else {
        var refid = Module.STDWEB_PRIVATE.acquire_rust_reference( value );
        HEAPU8[ address + 12 ] = 9;
        HEAP32[ address / 4 ] = refid;
    }
};

// This is ported from Rust's stdlib; it's faster than
// the string conversion from Emscripten.
Module.STDWEB_PRIVATE.to_js_string = function to_js_string( index, length ) {
    index = index|0;
    length = length|0;
    var end = (index|0) + (length|0);
    var output = "";
    while( index < end ) {
        var x = HEAPU8[ index++ ];
        if( x < 128 ) {
            output += String.fromCharCode( x );
            continue;
        }
        var init = (x & (0x7F >> 2));
        var y = 0;
        if( index < end ) {
            y = HEAPU8[ index++ ];
        }
        var ch = (init << 6) | (y & 63);
        if( x >= 0xE0 ) {
            var z = 0;
            if( index < end ) {
                z = HEAPU8[ index++ ];
            }
            var y_z = ((y & 63) << 6) | (z & 63);
            ch = init << 12 | y_z;
            if( x >= 0xF0 ) {
                var w = 0;
                if( index < end ) {
                    w = HEAPU8[ index++ ];
                }
                ch = (init & 7) << 18 | ((y_z << 6) | (w & 63));

                output += String.fromCharCode( 0xD7C0 + (ch >> 10) );
                ch = 0xDC00 + (ch & 0x3FF);
            }
        }
        output += String.fromCharCode( ch );
        continue;
    }
    return output;
};

Module.STDWEB_PRIVATE.id_to_ref_map = {};
Module.STDWEB_PRIVATE.id_to_refcount_map = {};
Module.STDWEB_PRIVATE.ref_to_id_map = new WeakMap();
// Not all types can be stored in a WeakMap
Module.STDWEB_PRIVATE.ref_to_id_map_fallback = new Map();
Module.STDWEB_PRIVATE.last_refid = 1;

Module.STDWEB_PRIVATE.id_to_raw_value_map = {};
Module.STDWEB_PRIVATE.last_raw_value_id = 1;

Module.STDWEB_PRIVATE.acquire_rust_reference = function( reference ) {
    if( reference === undefined || reference === null ) {
        return 0;
    }

    var id_to_refcount_map = Module.STDWEB_PRIVATE.id_to_refcount_map;
    var id_to_ref_map = Module.STDWEB_PRIVATE.id_to_ref_map;
    var ref_to_id_map = Module.STDWEB_PRIVATE.ref_to_id_map;
    var ref_to_id_map_fallback = Module.STDWEB_PRIVATE.ref_to_id_map_fallback;

    var refid = ref_to_id_map.get( reference );
    if( refid === undefined ) {
        refid = ref_to_id_map_fallback.get( reference );
    }
    if( refid === undefined ) {
        refid = Module.STDWEB_PRIVATE.last_refid++;
        try {
            ref_to_id_map.set( reference, refid );
        } catch (e) {
            ref_to_id_map_fallback.set( reference, refid );
        }
    }

    if( refid in id_to_ref_map ) {
        id_to_refcount_map[ refid ]++;
    } else {
        id_to_ref_map[ refid ] = reference;
        id_to_refcount_map[ refid ] = 1;
    }

    return refid;
};

Module.STDWEB_PRIVATE.acquire_js_reference = function( refid ) {
    return Module.STDWEB_PRIVATE.id_to_ref_map[ refid ];
};

Module.STDWEB_PRIVATE.increment_refcount = function( refid ) {
    Module.STDWEB_PRIVATE.id_to_refcount_map[ refid ]++;
};

Module.STDWEB_PRIVATE.decrement_refcount = function( refid ) {
    var id_to_refcount_map = Module.STDWEB_PRIVATE.id_to_refcount_map;
    if( 0 == --id_to_refcount_map[ refid ] ) {
        var id_to_ref_map = Module.STDWEB_PRIVATE.id_to_ref_map;
        var ref_to_id_map_fallback = Module.STDWEB_PRIVATE.ref_to_id_map_fallback;
        var reference = id_to_ref_map[ refid ];
        delete id_to_ref_map[ refid ];
        delete id_to_refcount_map[ refid ];
        ref_to_id_map_fallback.delete(reference);
    }
};

Module.STDWEB_PRIVATE.register_raw_value = function( value ) {
    var id = Module.STDWEB_PRIVATE.last_raw_value_id++;
    Module.STDWEB_PRIVATE.id_to_raw_value_map[ id ] = value;
    return id;
};

Module.STDWEB_PRIVATE.unregister_raw_value = function( id ) {
    delete Module.STDWEB_PRIVATE.id_to_raw_value_map[ id ];
};

Module.STDWEB_PRIVATE.get_raw_value = function( id ) {
    return Module.STDWEB_PRIVATE.id_to_raw_value_map[ id ];
};

Module.STDWEB_PRIVATE.alloc = function alloc( size ) {
    return Module.web_malloc( size );
};

Module.STDWEB_PRIVATE.dyncall = function( signature, ptr, args ) {
    return Module.web_table.get( ptr ).apply( null, args );
};

// This is based on code from Emscripten's preamble.js.
Module.STDWEB_PRIVATE.utf8_len = function utf8_len( str ) {
    var len = 0;
    for( var i = 0; i < str.length; ++i ) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var u = str.charCodeAt( i ); // possibly a lead surrogate
        if( u >= 0xD800 && u <= 0xDFFF ) {
            u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt( ++i ) & 0x3FF);
        }

        if( u <= 0x7F ) {
            ++len;
        } else if( u <= 0x7FF ) {
            len += 2;
        } else if( u <= 0xFFFF ) {
            len += 3;
        } else if( u <= 0x1FFFFF ) {
            len += 4;
        } else if( u <= 0x3FFFFFF ) {
            len += 5;
        } else {
            len += 6;
        }
    }
    return len;
};

Module.STDWEB_PRIVATE.prepare_any_arg = function( value ) {
    var arg = Module.STDWEB_PRIVATE.alloc( 16 );
    Module.STDWEB_PRIVATE.from_js( arg, value );
    return arg;
};

Module.STDWEB_PRIVATE.acquire_tmp = function( dummy ) {
    var value = Module.STDWEB_PRIVATE.tmp;
    Module.STDWEB_PRIVATE.tmp = null;
    return value;
};



    var HEAP8 = null;
    var HEAP16 = null;
    var HEAP32 = null;
    var HEAPU8 = null;
    var HEAPU16 = null;
    var HEAPU32 = null;
    var HEAPF32 = null;
    var HEAPF64 = null;

    Object.defineProperty( Module, 'exports', { value: {} } );

    function __web_on_grow() {
        var buffer = Module.instance.exports.memory.buffer;
        HEAP8 = new Int8Array( buffer );
        HEAP16 = new Int16Array( buffer );
        HEAP32 = new Int32Array( buffer );
        HEAPU8 = new Uint8Array( buffer );
        HEAPU16 = new Uint16Array( buffer );
        HEAPU32 = new Uint32Array( buffer );
        HEAPF32 = new Float32Array( buffer );
        HEAPF64 = new Float64Array( buffer );
    }

    return {
        imports: {
            env: {
                "__extjs_5984245de8b6ef88f693ba2383ebf3c2f9718c6c": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof HTMLCanvasElement) | 0;
            },
            "__extjs_9f22d4ca7bc938409787341b7db181f8dd41e6df": function($0) {
                Module.STDWEB_PRIVATE.increment_refcount( $0 );
            },
            "__extjs_80d6d56760c65e49b7be8b6b01c1ea861b046bf0": function($0) {
                Module.STDWEB_PRIVATE.decrement_refcount( $0 );
            },
            "__extjs_d220ae70d3a0134672f453b7b2651d9c11f72dbf": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){console.log (($1))})());
            },
            "__extjs_ea0c73f1ba6a83436c31f0e56b32e78ac79ef526": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){document.getElementById ("log"). innerHTML = ($1)+ "<br/>" + document.getElementById ("log"). innerHTML})());
            },
            "__extjs_d2a7ab5303126819bb5b442ebe08f94cb0604dec": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){var on_touch_event = ($1); var canvas = document.getElementById ("canvas"); canvas.addEventListener ("touchstart" , function (e){e.preventDefault (); var touch = e.targetTouches [0]; on_touch_event ("touchstart" , touch.clientX , touch.clientY , touch.clientX - canvas.offsetLeft , touch.clientY - canvas.offsetTop);}, false); canvas.addEventListener ("touchmove" , function (e){e.preventDefault (); var touch = e.targetTouches [0]; on_touch_event ("touchmove" , touch.clientX , touch.clientY , touch.clientX - canvas.offsetLeft , touch.clientY - canvas.offsetTop);}, false); canvas.addEventListener ("touchend" , function (e){on_touch_event ("touchend" , 0 , 0 , 0 , 0);}, false); canvas.addEventListener ("touchcancel" , function (e){on_touch_event ("touchcancel" , 0 , 0 , 0 , 0);}, false);})());
            },
            "__extjs_496ebd7b1bc0e6eebd7206e8bee7671ea3b8006f": function($0, $1, $2) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). querySelector (($2));})());
            },
            "__extjs_2034053b7b6771271a2dad3e5416b045a74488a1": function($0, $1, $2, $3) {
                Module.STDWEB_PRIVATE.acquire_js_reference( $0 ).setTimeout( function() {Module.STDWEB_PRIVATE.dyncall( 'vi', $1, [$2] );}, $3 );
            },
            "__extjs_93677063bfe06049229cc979f161294aa83b0bfe": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof PointerEvent && o.type === "pointerup") | 0;
            },
            "__extjs_e313f15435acbda1ee50355801d6dd989604ca8d": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof PointerEvent && o.type === "pointerout") | 0;
            },
            "__extjs_ab5cb3942c38455c95c95123489758fc220d9565": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof PointerEvent && o.type === "pointerdown") | 0;
            },
            "__extjs_9cbe3f041910b7b8710cf6692e325e3c397db838": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof PointerEvent && o.type === "pointermove") | 0;
            },
            "__extjs_ff5103e6cc179d13b4c7a785bdce2708fd559fc0": function($0) {
                Module.STDWEB_PRIVATE.tmp = Module.STDWEB_PRIVATE.to_js( $0 );
            },
            "__extjs_7c5535365a3df6a4cc1f59c4a957bfce1dbfb8ee": function($0, $1, $2, $3) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);Module.STDWEB_PRIVATE.from_js($0, (function(){var listener = ($1); ($2). addEventListener (($3), listener); return listener ;})());
            },
            "__extjs_dafc7a42f11dfd59d938a8bf392d728f25dc1191": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). clientX ;})());
            },
            "__extjs_e72c0fa59b4192eaa92dc61cdc746eab194f8d89": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). clientY ;})());
            },
            "__extjs_5c85c7d6be5e018baf0159f903350554c44f92f5": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). offsetX ;})());
            },
            "__extjs_3bac0850996e23130cb1036b2e74f99669c30680": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). offsetY ;})());
            },
            "__extjs_20ad46df0c338e20bd94061cd656da90c3ba5ba5": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). getContext ("2d");})());
            },
            "__extjs_a3b76c5b7916fd257ee3f362dc672b974e56c476": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). success ;})());
            },
            "__extjs_5ecfd7ee5cecc8be26c1e6e3c90ce666901b547c": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). error ;})());
            },
            "__extjs_00500cd5803682d52c028207482dae4d987b363b": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). canvas ;})());
            },
            "__extjs_2f0e52040c1612b5c8f209ef429c8b25c3b66f8b": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). fillStyle = ($1);
            },
            "__extjs_be62a332d41ddd62b4b77feacf9ec13c7ccb1191": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). font = ($1);
            },
            "__extjs_b42435b496a40339524d037e2aaaad915a207cea": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). lineWidth = ($1);
            },
            "__extjs_db305a6c5a92182cd239c9b558d60da7483bb5aa": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). strokeStyle = ($1);
            },
            "__extjs_71814f536817e145bf617f76f3fb9c183ccaa313": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). textAlign = ($1);
            },
            "__extjs_5b06766e9b8fe7f9a78694fbeb8578c5da969c0f": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). textBaseline = ($1);
            },
            "__extjs_0e2bf459d0b8f87b08234063cba9ddd7a35bfbc6": function($0, $1, $2, $3, $4, $5, $6) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);$4 = Module.STDWEB_PRIVATE.to_js($4);$5 = Module.STDWEB_PRIVATE.to_js($5);$6 = Module.STDWEB_PRIVATE.to_js($6);($0). arc (($1), ($2), ($3), ($4), ($5), ($6));
            },
            "__extjs_c316475a01a50f3dfea2c3ec1fbe6277eafe16f2": function($0) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);($0). beginPath ();
            },
            "__extjs_bf0e892d0bc47772f414e3f246754d2d86c9528d": function($0, $1, $2, $3, $4) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);$4 = Module.STDWEB_PRIVATE.to_js($4);Module.STDWEB_PRIVATE.from_js($0, (function(){try {($1). drawImage (($2), ($3), ($4)); return {success : true};}catch (error){return {error : error , success : false};}})());
            },
            "__extjs_ad822403fcce3173c9656c058bbbd45087d2cfa1": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). fill (($1));
            },
            "__extjs_24e7348ebd4300e26b55234a3fd3454a78955a76": function($0, $1, $2, $3, $4) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);$4 = Module.STDWEB_PRIVATE.to_js($4);($0). fillRect (($1), ($2), ($3), ($4));
            },
            "__extjs_bf4a1d0ebf8d0a83d15d3c9334ad2fcafbd5b71e": function($0, $1, $2, $3) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);($0). fillText (($1), ($2), ($3));
            },
            "__extjs_bc37356eeab30045188419c598a7bc84ea209f2a": function($0, $1, $2, $3, $4) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);$4 = Module.STDWEB_PRIVATE.to_js($4);($0). fillText (($1), ($2), ($3), ($4));
            },
            "__extjs_4c3d23fbc56db3e2ef0701318fb0fc2a36d37776": function($0, $1, $2) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);($0). lineTo (($1), ($2));
            },
            "__extjs_f930b076cc761caaaaaaf5dfb548bb4e2ef5f084": function($0, $1, $2) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);($0). moveTo (($1), ($2));
            },
            "__extjs_052eb90e4be7830195f8967b85b711a37cf0626c": function($0) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);($0). restore ();
            },
            "__extjs_de08a566f88f5ce4582cd2816abf86f3c7a86f56": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). rotate (($1));
            },
            "__extjs_304c4a1c2f732cddb1e7923aa13a2f36e90e8d0f": function($0) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);($0). save ();
            },
            "__extjs_e23cdce588709f2e6863222b066a7d2894bf5377": function($0, $1, $2) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);($0). scale (($1), ($2));
            },
            "__extjs_91dab63e56822f23ca28d09e9dd6bd999611ef53": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). setLineDash (($1));
            },
            "__extjs_21adbe0d4961da567547899cd36d8c90c9ccc8b8": function($0) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);($0). stroke ();
            },
            "__extjs_774c73f8d5accb8c8e3c08b4ab0d34c70766e846": function($0, $1, $2, $3, $4) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);$4 = Module.STDWEB_PRIVATE.to_js($4);($0). strokeRect (($1), ($2), ($3), ($4));
            },
            "__extjs_4995242ea68f8ee70dc2ea0a987f8c3fefcb1273": function($0, $1, $2) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);($0). translate (($1), ($2));
            },
            "__extjs_ea616dc5ba4767572f03b776a1fb421c8b84a57e": function($0) {
                var r = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (r instanceof DOMException) && (r.name === "IndexSizeError");
            },
            "__extjs_0a02c7764aacc2ed939a149ae98000223d3eebe8": function($0) {
                var r = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (r instanceof DOMException) && (r.name === "InvalidStateError");
            },
            "__extjs_4bb37a461a98d923479c58a87b623248a95b62ca": function($0) {
                var r = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (r instanceof DOMException) && (r.name === "TypeError");
            },
            "__extjs_7acc5a611b1dfdb40f09c005d173515f6f286581": function($0) {
                var r = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (r instanceof DOMException) && (r.name === "NotSupportedError");
            },
            "__extjs_89611721005b3de331324f19bedec5df179862e4": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof CanvasRenderingContext2D) | 0;
            },
            "__extjs_285aac3fba72d67cb459d37d4d21aa4fb62598ba": function($0) {
                Module.STDWEB_PRIVATE.arena = $0;
            },
            "__extjs_dc2fd915bd92f9e9c6a3bd15174f1414eee3dbaf": function() {
                console.error( 'Encountered a panic!' );
            },
            "__extjs_97495987af1720d8a9a923fa4683a7b683e3acd6": function($0, $1) {
                console.error( 'Panic error message:', Module.STDWEB_PRIVATE.to_js_string( $0, $1 ) );
            },
            "__extjs_72fc447820458c720c68d0d8e078ede631edd723": function($0, $1, $2) {
                console.error( 'Panic location:', Module.STDWEB_PRIVATE.to_js_string( $0, $1 ) + ':' + $2 );
            },
            "__extjs_9753633c3f23bcd5d7d2b9f59b2b5eceaa5d21f8": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){return new Image ();})());
            },
            "__extjs_a72c1c3711c212b05f52b8743debbfb8f27e1926": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). height ;})());
            },
            "__extjs_d03bec785cb278586b42d8a10443d970fee278b6": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). src = ($1);
            },
            "__extjs_fa54d8a49420847890278c906f291a2ce1dd03ca": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof HTMLImageElement) | 0;
            },
            "__extjs_1c8769c3b326d77ceb673ada3dc887cf1d509509": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){return document ;})());
            },
            "__extjs_74d5764ddc102a8d3b6252116087a68f2db0c9d4": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){return window ;})());
            },
            "__extjs_ae3cbd224f9d5c5e82750fd6b9d46fd91b2f397a": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). innerWidth ;})());
            },
            "__extjs_66cd7b3158f81a269e6c4e919e80a10441401908": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). innerHeight ;})());
            },
            "__extjs_690fa77630cde409b06b28d7cb33cf9d181b389e": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). height = ($1);
            },
            "__extjs_6c47cfe7b20d140c462be80002863de205806d99": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return ($1). width ;})());
            },
            "__extjs_9b6375c037b486fe12587b716aff148f791f3e6a": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0). width = ($1);
            },
            "__extjs_0aced9e2351ced72f1ff99645a129132b16c0d3c": function($0) {
                var value = Module.STDWEB_PRIVATE.get_raw_value( $0 );return Module.STDWEB_PRIVATE.register_raw_value( value );
            },
            "__extjs_db0226ae1bbecd407e9880ee28ddc70fc3322d9c": function($0) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);Module.STDWEB_PRIVATE.unregister_raw_value (($0));
            },
            "Math_acos": function($0) {
                return Math.acos( $0 );
            },
                "__web_on_grow": __web_on_grow
            }
        },
        initialize: function( instance ) {
            Object.defineProperty( Module, 'instance', { value: instance } );
            Object.defineProperty( Module, 'web_malloc', { value: Module.instance.exports.__web_malloc } );
            Object.defineProperty( Module, 'web_free', { value: Module.instance.exports.__web_free } );
            Object.defineProperty( Module, 'web_table', { value: Module.instance.exports.__web_table } );

            
            __web_on_grow();
            Module.instance.exports.main();

            return Module.exports;
        }
    };
}
 ));
}));
