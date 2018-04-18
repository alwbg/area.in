/**
 * @autor alwbg@163.com | soei
 * -----------------------------------
 * - https://github.com/alwbg/areain -
 * -----------------------------------
 * creation-time : 2018-04-09 17:35:24 PM
 * 支持全局和 AMD和CMD调用
 */
;(function( global, factory ){
	global[ 'global' ] = global;
	if( typeof exports === 'object' ) {
		factory( require, exports, module );
	} else if (typeof define === 'function') {
		//AMD CMD
		define( 'areain', factory );
	} else {
		var funcName = 'require';
		if( funcName && !global[ funcName ] ) {
			global[ funcName ] = function( id ) {
				return global[id];
			};
		};
		var MODULE = { exports : {} };
		factory( global[ funcName ] || function( id ) {
			alert( '需要实现 require(),加载模块:"' + id + '"' );
		}, MODULE.exports, MODULE );
		global['areain'] = MODULE.exports;
	}
}( this, function( require, exports, module ) {
	//多属性查找
	function area() {
		this.__ = this;
	};
	function copys( key, val ) {
		area.__key_ = key;
		area.__val_ = val;
		return true;
	}
	//属性操作对照列表 key="value"
	var _OPT_MAP = {
		'=' : function( O, attr, val ) {
			return this[ '__' ]( O, attr ) === val && copys( attr, val );
		},
		''  : function( O, attr, val ) {
			var bool = O.getAttribute && O.getAttribute( attr ) !== null;
			return  bool && O.setAttribute( 'data-query-mark', attr ), bool && copys( attr, this[ '__' ]( O, attr ) ), bool;
		},
		'__'  : function( O, attr, val ) {
			return O.getAttribute && O.getAttribute( attr );//!= null;
		}
	};
	var
		space = '';
	//事件处理
	var MAP = {
		//class
		'.' : function( O, clazz ) {
			if( ! this[ clazz ] ) this[ clazz ] = new RegExp( '(?:\\s|^)'+ clazz +'(?:\\s|$)', 'i' );
			var bool = this[ clazz ].test( O.className );
			return copys('class', clazz ), bool;
		},
		//ID
		'#' : function( O, id ) {
			return copys('id', id ), O.id === id;
		},
		//tagName
		''  : function( O, tag ) {
			return copys( 'tag', tag ), O.tagName === tag.toUpperCase();
		},
		/**
		 * 检索#ID|.class|Tag|[attr="value"]的组合
		 * @param  {String} O       目标对象
		 * @param  {String} ic      标识 id|class #|.
		 * @param  {String} itc     ID|tagName|className
		 * @param  {String} attr    属性名称
		 * @param  {String} opt     操作符 主要针对属性使用
		 * @param  {String} val     属性对应值
		 */
		run : function( O, ic, itc, attr, opt, val ) {
			//是否与指定的itc 包含或者相等
			var eqItc   = itc && MAP[ ic || space ]( O, itc );
			//判断相应的属性值是否与条件相匹配
			var eqAttr  = attr && _OPT_MAP[ opt || space ]( O, attr, val );
			//如果itc和属性同时存在 判断双方是否都符合条件
			return itc && attr ? eqItc && eqAttr : ( eqItc || eqAttr );
		}
	};
	//[标示符] [I,t,c] [attr] [opt] [value]
	var SPLIT = /(?:\s|,|\||^)(#|\.)*([\w-]+)*(?:\[([\w-]+)(?:([\!]?\=)['"]([^'"]*)['"]|)\])*/g;
	/**
	 * 匹配 class|tagName|attribute|id
	 */
	function Query( selector ) {
		var map = [];
		selector.replace( SPLIT, function( $l, $1, itc, attr, opt, val ) {
				if( itc || attr ) map.push( [ MAP.run, $1, itc, attr, opt, val ] );
				//self.echo( JSON.stringify(arguments, null, '\r\t') )
				return space;
			}
		);
		return map;
	};
	/* 默认处理函数 */
	function T() {
		this.__ = this;
	};
	/* 处理匹配所对应函数的值 */
	function run( O, args, content ) {
		args = args.slice();
		var func = args.shift() || T;
		args.unshift( O );
		return func.apply( content, args );
	}
	var content = {};
	function is( Q, O ) {
		var bool;
		copys( null, null );
		for( var i = Q.length; i--; ) {
			bool = run( O, Q[ i ], content );
			if( bool ) break;
		}
		return bool;
	}
	/**
	 * 处理多个
	 * @param  {String} string 
	 */
	function more( string, target ) {
		var tic = string.split( /\s*,\s*/g/*/(?=\.|#)/g*/ );
		var isTrue;
		for( var i = 0, length = tic.length; i < length; i++ ) {
			isTrue = is( Query( tic[ i ]), target );
			if( isTrue ) return target;
		}
		return null;
	}
	//判断指定元素是否在选择器范围之内
	area.within = function( v, target ) {
		var Qs = Query( v );
		copys( null, null );
		while( target ) {
			if( is( Qs, target ) ) return target;
			target = target.parentNode;
		}
		return target;
	};
	//判断当前
	area.is = function( v, target ) {
		return more( v, target );
	};
	var CLASSMAP = {};
	function classx( clazz, target, isadd ){
		var r;
		if( clazz in CLASSMAP ) {
			r = CLASSMAP[ clazz ];
		} else {
			r = CLASSMAP[ clazz ] = new RegExp( '(?:(?:^|\\s+)'+ clazz +'(?:\\s+|$)|\\s{2,})', 'g' );
		}
		var cls = target.className;
		if( isadd != undefined ) ! r.test( cls ) && (target.className = cls + ' ' + clazz);
		else target.className = cls.replace( r, space );
	}
	area.addClass = function( clazz, target ){
		classx( clazz, target, true );
	}
	area.removeClass = function( clazz, target ){
		classx( clazz, target );
	}
	module.exports = area;
}));
