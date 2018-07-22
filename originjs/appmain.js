controlRerquest("data/control.smr", main)

function main() {
    window.scrollTo(0, 0);
    window.sbig = false;
    var notplaypaysound = false;
    var kokutid;
    var kokuti;
    slotmodule.on("allreelstop", function(e) {
        if (e.hits != 0) {
            if (e.hityaku.length == 0)
                return
            var matrix = e.hityaku[0].matrix;
            var count = 0;
            slotmodule.once("bet", function() {
                slotmodule.clearFlashReservation()
            })
            if (e.hityaku[0].name.indexOf("Dummy") != -1 ||
                e.hityaku[0].name.indexOf("1枚役") != -1 ){
                notplaypaysound = true;
            } else {
                notplaypaysound = false;
                slotmodule.setFlash(null, 0, function(e) {
                    slotmodule.setFlash(flashdata.default, 20)
                    slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                })
            }
        }
        if (e.hits == 0 && jacflag && gamemode == "big") {
            slotmodule.setFlash(flashdata.syoto)
            slotmodule.once('bet', function() {
                slotmodule.clearFlashReservation()
            })
        }
        if (gamemode == "big") {
            bonusdata.bonusgame--;
            changeBonusSeg()
        }

        if (gamemode == "jac" || gamemode == "reg") {
            bonusdata.jacgamecount--;
            changeBonusSeg()
        }

        replayflag = false;
        var nexter = true;

        e.hityaku.forEach(function(d) {
            var matrix = d.matrix;
            switch (gamemode) {
                case 'normal':
                    switch (d.name) {
                        case "7":
                            sbig = bonusflag == 'BIG2';
                            var bgmData = {
                                "BIG": {
                                    tag: "BIG1",
                                    loopStart: 0.582
                                },
                                "SBIG": {
                                    tag: "SBIG",
                                    loopStart: 6.577
                                }
                            }
                            sounder.stopSound("bgm");
                            setGamemode('big');
                            var currentBig = bgmData[sbig?'SBIG':'BIG'];
                            sounder.playSound(currentBig.tag, true, null, currentBig.loopStart)
                            bonusdata = {
                                bonusgame:30,
                                jaccount: 3
                            }
                            bonusflag = "none";
                            changeBonusSeg()
                            clearLamp()
                            kokuti = false;
                            kokutid = false;
                            break;
                        case "BAR":
                            setGamemode('reg');
                            sounder.stopSound("bgm");
                            sounder.playSound("reg", true);
                            bonusdata = {
                                jacgetcount:8,
                                jacgamecount:8,
                                jaccount:0
                            }
                            changeBonusSeg();
                            bonusflag = "none";
                            clearLamp()
                            break;
                        case "チェリー":
                            matrix = matrix.map((arr) => {
                                arr[1] = 0;
                                arr[2] = 0;
                                return arr;
                            })
                            slotmodule.setFlash(null, 0, function(e) {
                                slotmodule.setFlash(flashdata.default, 20)
                                slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                            })
                            break
                        case "リプレイ":
                            replayflag = true;
                            break;
                    }
                    break;
                case 'big':
                    if(d.name == "リプレイ"){
                        setGamemode('jac');
                        // sounder.stopSound("bgm");
                        // sounder.playSound("reg", true);
                        bonusdata.jacgetcount = 8;
                        bonusdata.jacgamecount = 8;
                        bonusdata.jaccount--;
                        changeBonusSeg();
                        bonusflag = "none";
                        clearLamp()
                    }
                    // bonusdata.bonusgame--;
                    break;
                case 'reg':
                case 'jac':
                    changeBonusSeg()
                    bonusdata.jacgetcount--;
                    // bonusdata.jacgamecount--;
            }
        })
        if ((gamemode == 'jac'||gamemode == 'reg')  && ( bonusdata.jacgamecount == 0 || bonusdata.jacgetcount == 0)) {

            if(bonusdata.jaccount){
                setGamemode('big');
            }else{
                setGamemode('normal');
                sounder.stopSound("bgm")
                segments.effectseg.reset();
                slotmodule.once("payend", function() {})
            }
        }
        if(gamemode == 'big' && bonusdata.bonusgame == 0){
            setGamemode('normal');
            sounder.stopSound("bgm")
            segments.effectseg.reset();
            slotmodule.once("payend", function() {})
        }

        if (nexter) {
            e.stopend()
        }
    })

    slotmodule.on("payend", function() {
        if (gamemode != "normal") {
            if (bonusdata.geted >= bonusdata.bonusget) {
                slotmodule.emit("bonusend");
                setGamemode("normal")
                sounder.stopSound('bgm')
            }
        }
    })
    slotmodule.on("leveron", function() {
    })

    slotmodule.on("bet", function(e) {
        sounder.playSound("3bet")
        if ("coin" in e) {
            (function(e) {
                var thisf = arguments.callee;
                if (e.coin > 0) {
                    coin--;
                    e.coin--;
                    incoin++;
                    changeCredit(-1);
                    setTimeout(function() {
                        thisf(e)
                    }, 100)
                } else {
                    if(kokuti){
                        slotmodule.freeze();
                        sounder.playSound('kokuti');
                        slotmodule.setFlash(flashdata.blue,200,()=>{
                            slotmodule.resume();
                            slotmodule.clearFlashReservation();
                            slotmodule.setFlash(flashdata.default)
                        });
                        kokutid = true;
                        kokuti = false;
                    }
                    e.betend();
                }
            })(e)
        }
        if (gamemode == "jac") {
            segments.payseg.setSegments(bonusdata.jacgamecount)
        } else {
            segments.payseg.reset();
        }
    })

    slotmodule.on("pay", function(e) {
        var pays = e.hityaku.pay;
        var arg = arguments;
        if (gamemode != "normal") {
            changeBonusSeg();
        }
        if (!("paycount" in e)) {
            e.paycount = 0
            e.se = "pay";
            if(gamemode != "normal"){
                e.se = "cherry"
                if(pays == 15){
                    e.se = "bigpay"
                }
            }
            if(pays <= 4 && pays) e.se = "cherry";
            if(!replayflag && !notplaypaysound){
                sounder.playSound(e.se, e.se != "cherry");
            }
        }
        if (pays == 0) {
            if (replayflag && replayflag && e.hityaku.hityaku[0].name != "チェリー") {
                sounder.playSound("replay", false, function() {
                    e.replay();
                    slotmodule.emit("bet", e.playingStatus);
                });
            } else {
                if (replayflag) {
                    e.replay();
                    slotmodule.clearFlashReservation()
                } else {
                    e.payend()
                }
                sounder.stopSound(e.se)
            }
        } else {
            e.hityaku.pay--;
            coin++;
            e.paycount++;
            outcoin++;
            if (gamemode != "normal") {
                bonusdata.geted++;
            }
            changeCredit(1);
            segments.payseg.setSegments(e.paycount)
            setTimeout(function() {
                arg.callee(e)
            }, 60)
        }
    })

    var jacflag = false;

    slotmodule.on("lot", function(e) {
        var ret = -1;
        var lot;
        switch (gamemode) {
            case "normal":
                lot = normalLotter.lot().name

                lot = window.power || lot;
                window.power = undefined

                switch (lot) {
                    case "リプレイ":
                        ret = lot
                        break;
                    case "ベル":
                        ret = "プラム"
                        if(!rand(8)){
                            ret = "滑りプラム"
                        }
                        break
                    case "スイカ":
                        ret = "平行スイカ"
                        if(!rand(8)){
                            ret = "斜めスイカ"
                        }
                        break
                    case "チェリー":
                    case "3枚役":
                        ret = lot;
                        break;
                    case "BIG":
                        if (bonusflag == "none") {
                            ret = [
                                "滑りなしリーチ目",
                                "プラムはずれリーチ目",
                                "平行スイカはずれリーチ目",
                                "斜めスイカはずれリーチ目",
                                "滑りブランクリーチ目"
                                ][rand(5)]
                            bonusflag = ['BIG2','BIG1'][rand(2)];
                        } else {
                            switch(bonusflag){
                                case 'BIG1':
                                    ret = 'シングルBIG';
                                    break
                                case 'BIG2':
                                    ret = 'ダブルBIG';
                                    break
                                case 'REG':
                                    ret = 'REG';
                                    break
                            }
                        }
                        break;
                    case "REG":
                        if (bonusflag == "none") {
                            ret = [
                                "滑りなしリーチ目",
                                "プラムはずれリーチ目",
                                ][rand(2)]
                            bonusflag = 'REG';
                        } else {
                            switch(bonusflag){
                                case 'BIG1':
                                    ret = 'シングルBIG';
                                    break
                                case 'BIG2':
                                    ret = 'ダブルBIG';
                                    break
                                case 'REG':
                                    ret = 'REG';
                                    break
                            }
                        }
                        break;
                    default:
                        ret = "はずれ" + (rand(2)+1)
                        if (bonusflag != "none") {
                            switch(bonusflag){
                                case 'BIG1':
                                    ret = 'シングルBIG';
                                    break
                                case 'BIG2':
                                    ret = 'ダブルBIG';
                                    break
                                case 'REG':
                                    ret = 'REG';
                                    break
                            }
                        }

                }
                break;
            case "big":
                if(!rand(6)){
                    ret = "JACIN"
                }else{
                    ret = "ボーナス" + (rand(6)+1);
                }
                if(ret == 'JACIN'){
                    sounder.playSound('yokoku')
                }
                break;
            case "reg":
            case "jac":
                ret = "JACGAME"
                break;
        }
        effect(ret,lot);
        return ret;
    })

    slotmodule.on("reelstop", function() {
        sounder.playSound("stop")
    })

    $("#saveimg").click(function() {
        SaveDataToImage();
    })

    $("#cleardata").click(function() {
        if (confirm("データをリセットします。よろしいですか？")) {
            ClearData();
        }
    })

    $("#loadimg").click(function() {
        $("#dummyfiler").click();
    })

    $("#dummyfiler").change(function(e) {

        var file = this.files[0];

        var image = new Image();
        var reader = new FileReader();
        reader.onload = function(evt) {
            image.onload = function() {
                var canvas = $("<canvas></canvas>")
                canvas[0].width = image.width;
                canvas[0].height = image.height;
                var ctx = canvas[0].getContext('2d');
                ctx.drawImage(image, 0, 0)
                var imageData = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height)
                var loadeddata = SlotCodeOutputer.load(imageData.data);
                if (loadeddata) {
                    parseSaveData(loadeddata)
                    alert("読み込みに成功しました")
                } else {
                    alert("データファイルの読み取りに失敗しました")
                }
            }
            image.src = evt.target.result;
        }
        reader.onerror = function(e) {
            alert("error " + e.target.error.code + " \n\niPhone iOS8 Permissions Error.");
        }
        reader.readAsDataURL(file)
    })

    slotmodule.on("reelstart", function() {
        if (okure) {
            setTimeout(function() {
                sounder.playSound("start")
            }, 300)
        } else {
            if(!muon){
                sounder.playSound("start")
            }
        }
        okure = false;
        muon = false;
    })
    var okure = false;
    var muon = false;
    var sounder = new Sounder();

    sounder.addFile("sound/stop.wav", "stop").addTag("se");
    sounder.addFile("sound/start.wav", "start").addTag("se");
    sounder.addFile("sound/bet.wav", "3bet").addTag("se");
    sounder.addFile("sound/pay.wav", "pay").addTag("se");
    sounder.addFile("sound/replay.wav", "replay").addTag("se");
    sounder.addFile("sound/BIG1.mp3", "BIG1").addTag("bgm")
    sounder.addFile("sound/SBIG.mp3", "SBIG").addTag("bgm")
    sounder.addFile("sound/reg1.mp3", "reg").addTag("bgm");
    sounder.addFile("sound/title.wav",'title').addTag("se");
    sounder.addFile("sound/type.mp3",'type').addTag("se");
    sounder.addFile("sound/yokoku.wav",'yokoku').addTag("se");
    sounder.addFile("sound/kokuti.mp3",'kokuti').addTag("se");
    sounder.addFile("sound/syoto.mp3","syoto").addTag("se");
    sounder.addFile("sound/syotoyokoku.mp3","syotoyokoku").addTag("se");
    sounder.addFile("sound/cherry.mp3","cherry").addTag("se");
    sounder.addFile("sound/bigpay.mp3","bigpay").addTag("se");

    sounder.setVolume("se", 0.2)
    sounder.setVolume("bgm", 0.1)
    sounder.loadFile(function() {
        window.sounder = sounder
        console.log(sounder)
    })

    var normalLotter = new Lotter(lotdata.normal);
    var bigLotter = new Lotter(lotdata.big);
    var jacLotter = new Lotter(lotdata.jac);


    var gamemode = "normal";
    var bonusflag = "none"
    var coin = 0;

    var bonusdata;
    var replayflag;

    var isCT = false;
    var CTBIG = false;
    var isSBIG;
    var ctdata = {};
    var regstart;

    var afterNotice;
    var bonusSelectIndex;
    var ctNoticed;

    var playcount = 0;
    var allplaycount = 0;

    var incoin = 0;
    var outcoin = 0;

    var bonuscounter = {
        count: {},
        history: []
    };

    slotmodule.on("leveron", function() {

        if (gamemode == "normal") {
            playcount++;
            allplaycount++;
        } else {
            if (playcount != 0) {
                bonuscounter.history.push({
                    bonus: gamemode,
                    game: playcount
                })
                playcount = 0;
            }
        }
        changeCredit(0)
    })

    function stringifySaveData() {
        return {
            coin: coin,
            playcontroldata: slotmodule.getPlayControlData(),
            bonuscounter: bonuscounter,
            incoin: incoin,
            outcoin: outcoin,
            playcount: playcount,
            allplaycount: allplaycount,
            name: "ツインセブン",
            id: "twinseven"
        }
    }

    function parseSaveData(data) {
        coin = data.coin;
        // slotmodule.setPlayControlData(data.playcontroldata)
        bonuscounter = data.bonuscounter
        incoin = data.incoin;
        outcoin = data.outcoin;
        playcount = data.playcount;
        allplaycount = data.allplaycount
        changeCredit(0)
    }

    window.SaveDataToImage = function() {
        SlotCodeOutputer.save(stringifySaveData())
    }

    window.SaveData = function() {
        if (gamemode != "normal" || isCT) {
            return false;
        }
        var savedata = stringifySaveData()
        localStorage.setItem("savedata", JSON.stringify(savedata))
        return true;
    }

    window.LoadData = function() {
        if (gamemode != "normal" || isCT) {
            return false;
        }
        var savedata = localStorage.getItem("savedata")
        try {
            var data = JSON.parse(savedata)
            parseSaveData(data)
            changeCredit(0)
        } catch (e) {
            return false;
        }
        return true;
    }

    window.ClearData = function() {
        coin = 0;
        bonuscounter = {
            count: {},
            history: []
        };
        incoin = 0;
        outcoin = 0;
        playcount = 0;
        allplaycount = 0;

        SaveData();
        changeCredit(0)
    }


    var setGamemode = function(mode) {
        switch (mode) {
            case 'normal':
                gamemode = 'normal'
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(3);
                isSBIG = false
                break;
            case 'big':
                gamemode = 'big';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(1)
                });
                slotmodule.setMaxbet(3);
                break;
            case 'reg':
                gamemode = 'reg';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(2)
                });
                slotmodule.setMaxbet(1);
                break;
            case 'jac':
                gamemode = 'jac';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(2)
                });
                slotmodule.setMaxbet(1);
                break;
        }
    }

    var segments = {
        creditseg: segInit("#creditSegment", 2),
        payseg: segInit("#paySegment", 2),
        effectseg: segInit("#effectSegment", 4)
    }

    var credit = 50;
    segments.creditseg.setSegments(50);
    segments.creditseg.setOffColor(80, 30, 30);
    segments.payseg.setOffColor(80, 30, 30);
    segments.creditseg.reset();
    segments.payseg.reset();


    var lotgame;

    function changeCredit(delta) {
        credit += delta;
        if (credit < 0) {
            credit = 0;
        }
        if (credit > 50) {
            credit = 50;
        }
        $(".GameData").text("差枚数:" + coin + "枚  ゲーム数:" + playcount + "G  総ゲーム数:" + allplaycount + "G")
        segments.creditseg.setSegments(credit)
    }

    function changeBonusSeg() {
        if(gamemode == 'big'){
            segments.effectseg.setSegments(""+bonusdata.bonusgame);
        }else{
            var {jacgetcount,jaccount} = bonusdata;
            segments.effectseg.setSegments(`${jaccount+1}-${jacgetcount}`);
        }

    }

    function changeCTGameSeg() {
        segments.effectseg.setOnColor(230, 0, 0);
        segments.effectseg.setSegments(ctdata.ctgame);
    }

    function changeCTCoinSeg() {
        segments.effectseg.setOnColor(50, 100, 50);
        segments.effectseg.setSegments(200 + ctdata.ctstartcoin - coin);
    }

    var LampInterval = {
        right: -1,
        left: -1,
        counter: {
            right: true,
            left: false
        }
    }

    function setLamp(flags, timer) {
        flags.forEach(function(f, i) {
            if (!f) {
                return
            }
            LampInterval[["left", "right"][i]] = setInterval(function() {
                if (LampInterval.counter[["left", "right"][i]]) {
                    $("#" + ["left", "right"][i] + "neko").css({
                        filter: "brightness(200%)"
                    })
                } else {
                    $("#" + ["left", "right"][i] + "neko").css({
                        filter: "brightness(100%)"
                    })
                }
                LampInterval.counter[["left", "right"][i]] = !LampInterval.counter[["left", "right"][i]];
            }, timer)
        })
    }

    function clearLamp() {
        clearInterval(LampInterval.right);
        clearInterval(LampInterval.left);
        ["left", "right"].forEach(function(i) {
            $("#" + i + "neko").css({
                filter: "brightness(100%)"
            })
        })

    }

    function nabi(lot){
        if(lot == "JACIN") return;
        var nabiIdx = parseInt(lot.slice(-1))-1;
        var color = nabiIdx % 2 == 0 ? colordata.RED_B : colordata.BLUE_F;
        var reelIdx = ~~(nabiIdx / 2);
        var matrix = [[0,0,0],[0,0,0],[0,0,0]];
        matrix.forEach(arr=>{
            arr[reelIdx] = 1;
        })
        slotmodule.setFlash(replaceMatrix(flashdata.default,matrix, color, null));
        slotmodule.once('reelstop',()=>{
            slotmodule.clearFlashReservation();
        })
    }

    function effect(lot,orig) {
        if(gamemode!='normal'){
            if (sbig && gamemode == 'big'){
                nabi(lot);
            }
            return
        }
        if(kokutid){
            return;
        }
        var plot = lot;
        if(lot == 'REG' || bonusflag != 'none'){plot = 'BIG'}
        var eforig = /BIG|REG/.test(lot) ? 'BIG' : orig;
        var effect = getEffect[orig]&&getEffect[orig]();

        var typera = TypeTable[lot]&&TypeTable[lot]();

        if(typera){
            if(bonusflag!='none'){kokuti = true}
            if(bonusflag!='none'&&orig!='BIG'){return}
            slotmodule.freeze();
            Typewriter(typera,{
                speed:150,
                delay:5000,
            }).change((t)=>{
                t!="\n"&&sounder.playSound('type');
            }).title(()=>{
                sounder.playSound('title');
            }).finish((e)=>{
                e.parentNode.removeChild(e);
                setTimeout(()=>{
                    slotmodule.resume();
                },1000)
            });
            return;
        }
        if(!kokutid&&bonusflag!='none'&&!rand(4)){kokuti = true}
        if(!effect){
            console.log(orig)
            if((!orig&&!rand(256))||(orig=="3枚役")||kokuti){
                sounder.playSound("syotoyokoku");
                if(orig!="3枚役"){
                    slotmodule.once('allreelstop',()=>{
                        slotmodule.freeze();
                        segments.effectseg.setSegments("717");
                        sounder.playSound("syoto")
                        slotmodule.setFlash(flashdata.syoto)
                        var c = 2;
                        var timer = setInterval(()=>{
                            sounder.playSound("syoto")
                            segments.effectseg.setSegments(" 7"+c+"7");
                            c++;
                            if(c==7){
                                clearInterval(timer);
                                if(kokuti&&rand(8)){
                                    setTimeout(()=>{
                                        slotmodule.clearFlashReservation();
                                        segments.effectseg.setSegments("777");
                                        sounder.playSound("kokuti")
                                        slotmodule.setFlash(flashdata.blue,200,()=>{
                                            slotmodule.resume();
                                            kokutid = true;
                                            kokuti = false;
                                            slotmodule.clearFlashReservation();
                                        });
                                    },1000)
                                }else{
                                    setTimeout(()=>{
                                        slotmodule.clearFlashReservation();
                                        segments.effectseg.reset();
                                        slotmodule.resume();
                                    },1000)
                                }
                            }
                        },600)
                    })
                }
            return
            }
            if(lot=="チェリー"&&!rand(12)||(/BIG|REG/.test(orig)&&!rand(12))){
                okure = true
            }
            if(orig == "BIG" && sbig && !rand(32)){
                muon = true;
            }
            return
        }
        sounder.playSound('yokoku');
        var efsegs = segments.effectseg.randomSeg();
        var timer = setInterval(() => {
            efsegs[0].next()
            efsegs[1].next()
            efsegs[2].next()
        }, 30);
        var display = (e)=>{
            clearInterval(timer);
            segments.effectseg.setSegments(e.r.map(d=>d?'o':'_').join(''))
        }
        effect.r = [effect.r[1],effect.r[0],effect.r[2]]
        if(effect.timing >= 1){
            slotmodule.once('reelstop',function(e){
                var c = 4 - e.count;
                if( effect.timing == c ){
                    sounder.playSound('spstop');
                    display(effect)
                }else{
                    slotmodule.once('reelstop',arguments.callee)
                }
            })
        }else{
            display(effect)
        }
        slotmodule.once('bet',()=>{
            segments.effectseg.reset();
        })
    }


    $(window).bind("unload", function() {
        SaveData();
    });

    LoadData();
}

function and() {
    return Array.prototype.slice.call(arguments).every(function(f) {
        return f
    })
}

function or() {
    return Array.prototype.slice.call(arguments).some(function(f) {
        return f
    })
}

function rand(m) {
    return Math.floor(Math.random() * m);
}

function replaceMatrix(base, matrix, front, back) {
    var out = JSON.parse(JSON.stringify(base));
    matrix.forEach(function(m, i) {
        m.forEach(function(g, j) {
            if (g == 1) {
                front && (out.front[i][j] = front);
                back && (out.back[i][j] = back);
            }
        })
    })
    return out
}

function flipMatrix(base) {
    var out = JSON.parse(JSON.stringify(base));
    return out.map(function(m) {
        return m.map(function(p) {
            return 1 - p;
        })
    })
}

function segInit(selector, size) {
    var cangvas = $(selector)[0];
    var sc = new SegmentControler(cangvas, size, 0, -3, 79, 46);
    sc.setOffColor(120, 120, 120)
    sc.setOnColor(230, 0, 0)
    sc.reset();
    return sc;
}