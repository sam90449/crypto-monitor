async function loadCoin(side){

    let symbol = "";

    if(side === "left"){
        symbol = document.getElementById("leftInput").value.toUpperCase();
    }else{
        symbol = document.getElementById("rightInput").value.toUpperCase();
    }

    if(symbol === ""){
        return;
    }

    const pair = symbol + "USDT";

    try{

        const response =
        await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=" + pair
        );

        const data = await response.json();

        const price =
        parseFloat(data.price).toFixed(3);

        if(side === "left"){

            document.getElementById("leftPrice").innerHTML =
            pair + " : " + price;

            document.getElementById("leftPrediction").innerHTML =
            "1-3H Prediction : Loading...";

            document.getElementById("leftInfo").innerHTML =
            "SYMBOL : " + pair + "\nPRICE : " + price;

        }else{

            document.getElementById("rightPrice").innerHTML =
            pair + " : " + price;

            document.getElementById("rightPrediction").innerHTML =
            "1-3H Prediction : Loading...";

            document.getElementById("rightInfo").innerHTML =
            "SYMBOL : " + pair + "\nPRICE : " + price;

        }

    }catch(err){

        alert("LOAD FAILED");

    }

}

setInterval(()=>{

    loadCoin("left");
    loadCoin("right");

},180000);
