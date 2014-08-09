
var words = {
        words: require( './words.js' ),
        used: {}
    };

    var picturewords = {
        words: require( './wordsForPictures.js' ),
        used: {}
    };

function random( list ) {
    // Surely you haven't used *all* the words up?  Start over.
    if ( Object.keys( list.used ).length === list.words.length ) {
        list.used = {};
    }

    var random;
    do {
        random = list.words[ Math.floor( Math.random() * list.words.length ) ];
    } while( random in list.used );
    list.used[ random ] = 1;
    return random;
}

module.exports = {
    word: function() {
        return random( words );
    }
};


module.exports = {
    pictureword: function() {
        return random( picturewords );
    }
};


