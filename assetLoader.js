/*!
 * Asset Loader
 *
 * Copyright 2014 Bastian Koller <bastian.koller@gmail.com>
 * Date: 2014-06-25
 */
var assetLoader = ( function() {
	
	// queue of source paths
	var queue = {};
	
	// pool of finished loading sources
	var pool = {};

	// defined asset types with handler
	var types = { 'imgs' : loadByImage };
	
	// defined number of queues by type
	var numQueueByType = [];
	
	
	/**
	 * load given asset list by defined type function
	 * 
	 * @param {string} type
	 * @param {array} assetList
	 */
	function loadByAssetType( type, assetList ) {
		if( types[type] !== undefined ) {
			for( var listCnt in assetList ) {
				if( Object.keys( assetList[ listCnt ] ).length > 0 ) {

					// track number of queue items
					if( numQueueByType[type] == undefined )
					{
						numQueueByType[type] = 0;
					}
					numQueueByType[type] += Object.keys( assetList[ listCnt ] ).length;
					
					// handle each entry of current type
					for( var assetItemKey in assetList[ listCnt ] ) {
						( function( assetItem ) {
							
							// execute defined handler of type
							if( typeof types[type] == 'function' ) {
								types[type]( assetItemKey, assetItem );
							}
							
						} )( assetList[ listCnt ][ assetItemKey ] );
					}
				}
			}

		}
	}
	
	/**
	 * image loader
	 * 
	 * @param {string} imgKey
	 * @param {string} image
	 */
	function loadByImage( imgKey, image ) {
		var imgItem = new Image();
		imgItem.src = image;
		imgItem.name = imgKey;
		imgItem.onload = loadImgCallback.call( imgItem, 'imgs', imgKey );
	}
	
	/**
	 * image loader callback
	 *
	 * @param {string} type
	 * @param {string} keyName
	 */
	function loadImgCallback( type, keyName ) {
		if( pool[type] == undefined ) {
			pool[type] = [];
		}
		
		pool[type][keyName] = this;
	}
	
	
	/**
	 * fill queue for given type by source paths
	 * 
	 * @param {string} type
	 * @param {array} paths
	 */
	function add( type, paths ) {
		if( queue[type] == undefined ) {
			queue[type] = [];
		}

		queue[type].push( paths );
	}

	/**
	 * load sources by queue
	 * @param {object} loadCallback
	 */
	function load( loadCallback ) {
		if( Object.keys(queue).length > 0 ) {

			// number of successfully loaded queues by type
			var finishedQueueType = 0;
			
			for( var type in queue ) {

				if( queue.hasOwnProperty( type ) ) {
					( function( queueByType ) {
						loadByAssetType( type, queueByType );
					} )( queue[ type ] );
				}
				
				// check if load finished successfully by type
				if( numQueueByType[type] == Object.keys( pool[type] ).length ) {
					finishedQueueType++;
				}
			}
			
			// all assets load completely
			if( finishedQueueType == Object.keys( queue ).length ) {
				// execute callback after loading
				if( typeof loadCallback == 'function' ) {
					loadCallback();
				}
			}
		}
	}
	
	/**
	 * getter for asset item
	 *
	 * @param {Object} type
	 * @param {Object} assetKey
	 */
	function getItem( type, assetKey ) {
		if( pool[type] != undefined ) {
			if( pool[type][assetKey] != undefined ) {
				return pool[type][assetKey];
			}
			return false;
		}
	}

	return {
		add : add,
		load : load,
		getItem : getItem
	};
	
} )();
