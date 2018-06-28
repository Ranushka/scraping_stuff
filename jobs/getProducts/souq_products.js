
function* getProductLinks(catLists) {

  var pageNum = 1;
  var gotoUrl = catLists;
  var nightmare = Nightmare(),
    allLinks = [];

  while (nextExists) {

    let scrapedData = yield nightmare
      .goto(gotoUrl)
      .wait(3000)

    // loging scraping site url
    var url = yield nightmare.url();
    console.log(url);

    yield nightmare
      .evaluate(function () {

        var links = [],
          nextExists = window.location.search != "",
          productList = document.querySelectorAll('.block-grid-large');

        // going through each product
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('.itemTitle a')[0].innerText.trim(),
            "url": item.querySelectorAll('.itemTitle a')[0].href,
            "price": item.querySelectorAll('h5.price')[0].innerText.replace(' AED', '').trim(),
            "brand": item.querySelectorAll('[data-subcategory]')[0].getAttribute('data-subcategory'),
            "site": "souq",
          });
        });

        // return all the values
        return {
          'links': links,
          'nextExists': nextExists
        };

      }).then(async function (resalt) {
        nextExists = resalt.nextExists;
        if (nextExists) {
          await saveToDb(resalt.links);
        }

      })

    if (nextExists) {

      var url = yield nightmare.url();
      pageNum++;
      gotoUrl = `${catLists}?section=2&page=${pageNum}`;
      yield nightmare
        .goto(gotoUrl)
        .wait(3000)

    }

  }

}
