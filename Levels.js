var Levels = ['Newbie', 'Rookie', 'Beginner' , 'Skilled' ,'Advanced' ,'Expert'];

/*0 - 2000 Newbie
2001 - 4000 Rookie
4001 - 6000 Beginner
6001 - 8000 Skilled
8001 - 10000 Advanced
10001 - 15000 Expert */

var LevelPointsMap = {}
LevelPointsMap['Rookie'] = 2001;
LevelPointsMap['Beginner'] = 4001;
LevelPointsMap['Skilled'] = 6001;
LevelPointsMap['Advanced'] = 8001;
LevelPointsMap['Expert'] = 10001;

module.exports.Levels = Levels;
module.exports.LevelPointsMap = LevelPointsMap;