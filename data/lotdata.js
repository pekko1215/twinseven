/**
 * Created by pekko1215 on 2017/07/24.
 */

var lotdata = {
    normal: [
        {   name:"リプレイ",
            value:1/7.7},
        {   name:"ベル",
            value:1/7.7},
        {   name:"スイカ",
            value:1/64},
        {   name:"チェリー",
            value:1/32},
        {   name:"BIG",
            value:1/200},
        {   name:"REG",
            value:1/240},
        {   name:"3枚役",
            value:1/64}
    ],
    "big":[
        {
            name:"JACIN",
            value:1/7.7
        }
    ],
    "jac":[
        {
            name:"JACGAME",
            value:1
        }
    ]
}

var getEffect = {
    "リプレイ":()=>{
        if(rand(4)){return null}
        switch(rand(12)){
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                var r = [true,false,false];
                return {
                    timing:0,r
                }
            case 8:
            case 9:
            case 10:
                var r = [[true,true,false],[false,true,true]][rand(2)];
                return {
                    timing:0,
                    r
                }
            case 11:
                var r = [true,true,true];
                return {
                    timing:0,
                    r
                }
        }
    },
    "ベル":()=>{
        if(rand(4)){return null}
        switch(rand(12)){
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                return {
                    timing:0,r:[false,true,false]
                }
            case 8:
            case 9:
            case 10:
                var r = [[true,true,false],[false,true,true]][rand(2)];
                return {
                    timing:0,
                    r
                }
            case 11:
                return {
                    timing:0,
                    r:[true,true,true]
                }
        }
    },
    "スイカ":()=>{
        if(rand(2)){return null}
        switch(rand(7)){
            case 0:
                var r = rand(10)<6 ? [[false,true,true],[false,true,true]][rand(2)] : [false,false,true];
                return {
                    timing:0,r
                }
            case 1:
            case 2:
                var r = rand(10)<6 ? [[false,true,true],[false,true,true]][rand(2)] : [false,false,true];
                return {
                    timing:1,
                    r
                }
            case 3:
            case 4:
                var r = rand(10)<6 ? [[false,true,true],[false,true,true]][rand(2)] : [false,false,true];
                return {
                    timing:2,
                    r
                }
            case 5:
            case 6:
                var r = rand(10)<6 ? [[false,true,true],[false,true,true]][rand(2)] : [false,false,true];
                return {
                    timing:3,
                    r
                }
        }
    },
    "BIG":()=>{
        if(!rand(3)){return null}
        switch(rand(6)){
            case 0:
            case 1:
            case 3:
                var r = [false,false,false];
                r[rand(3)] = true;
                return {
                    timing:0,r
                }
            case 1:
            case 2:
                var r = [false,false,false];
                r[rand(3)] = true;
                r[rand(3)] = true;
                return {
                    timing:0,
                    r
                }
            case 4:
            case 5:
                var r = [false,false,false];
                r[rand(3)] = true;
                r[rand(3)] = true;
                r[rand(3)] = true;
                return {
                    timing:0,
                    r
                }
        }
    }
}

const TypeTable = {
    null:()=>{
        if(!rand(1360)){
            switch(rand(8)){
                case 0:
                case 1:
                case 2:
                    return 'ボーナス確定？';
                case 3:
                case 4:
                    return 'リーチ目で決めろ？';
                case 5:
                case 6:
                    return '1確で決めろ？'
                case 7:
                    return 'ゲチェナを盗め！'
            }
        }
    },
    'リプレイ':()=>{
        if(!rand(500)){
            return 'リプレイを盗め！'
        }
    },
    'ベル':()=>{
        if(!rand(500)){
            return 'プラムを盗め！'
        }
    },
    'スイカ':()=>{
        if(!rand(32)){
            return 'ベルを盗め！'
        }
    },
    'チェリー':()=>{
        if(!rand(64)){
            return 'チェリーを盗め！'
        }
    },
    'BIG':(sbig)=>{
        if(!rand(4)){
            switch(rand(8)){
                case 0:
                    return ['ボーナス確定？','リーチ目で決めろ？','1確で決めろ？','ゲチェナを盗め！'][rand(4)]
                case 1:
                    if(sbig && !rand(3)){
                        return 'スーパービッグ確定！'
                    }
                    return 'ボーナス確定！';
                case 2:
                    return 'リプレイを盗め！';
                case 3:
                    return 'プラムを盗め！';
                case 4:
                case 5:
                    return 'ベルを盗め！'
                case 6:
                case 7:
                    return'チェリーを盗め！';
            }
        }
    }
}