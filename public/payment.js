
/* Handle any errors returns from Checkout  */
var handleResult = function (result) {
  if (result.error) {
    var displayError = document.getElementById('error-message');
    displayError.textContent = result.error.message;
  }
};

let selectedPrice;

// Create a Checkout Session with the selected quantity
var createCheckoutSession = function () {
  var quantity = 1;
    if(selectedPrice == undefined){
        selectedPrice = priceList[0].id;
    }
  return fetch('/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity: quantity,
      locale: i18next.language.toLowerCase().split('-')[0],
      price: selectedPrice,
    }),
  }).then(function (result) {
    return result.json();
  });
};
let priceList;
/* fetch prices */
const prices = async () => {
    $("#rotate").toggle();
    let {priceData} = await fetch('price-fetch', { method: 'GET'}).then(function (result) {
        return result.json();
      });
    priceList = priceData;
    if(priceData){
        $("#rotate").toggle();
        priceData.map( async ({unit_amount})=> {
            $("#price_option").append("<option>"+ 
            "£" + unit_amount/100 
            + "</option>") 
            })
    }
}
const price_fetch = document.getElementById('price_pool');
    price_fetch.addEventListener('click', async (event) => {
        prices();
    })

$("#price_option").click(function(e){
        e.preventDefault();
        let selected;
        selected = e.target.value;
        let priceNum = parseFloat(selected.replace(/£/g, ""));
        let returnPriceId = priceList.find(e => e.unit_amount/100 == priceNum );
        selectedPrice = returnPriceId.id;
      });  

/* Get your Stripe publishable key to initialize Stripe.js */
fetch('/config')
  .then(function (result) {
    return result.json();
  })
  .then(function (json) {
    var stripe = Stripe(json.publicKey);
    // Setup event handler to create a Checkout Session on submit
    document.querySelector('#payNow').addEventListener('click', function (evt) {
      createCheckoutSession().then(function (data) {
          console.log(data);
        stripe
          .redirectToCheckout({
            sessionId: data.sessionId,
          })
          .then(handleResult);
      });
    });
  });
