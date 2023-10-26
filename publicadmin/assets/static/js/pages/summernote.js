$("#summernote").summernote({
  tabsize: 2,
  height: 120,

})

$("#description").summernote({
  tabsize: 2,
  height: 120,
})

$("#AboutDayanamic").summernote({
  tabsize: 2,
  height: 120,
})


$("#descriptions").summernote({
  tabsize: 2,
  height: 120,
})

$("#salary").summernote({
  tabsize: 2,
  height: 120,
})

$("#multiAdd").summernote({
  tabsize: 2,
  height: 120,
})

$(".editor").summernote({
  tabsize: 2,
  height: 120,
  // width: 1090,
});

$(".editors").summernote({
  tabsize: 2,
  height: 120,
})


$("#plans").summernote({
  tabsize: 2,
  height: 120,
})

$("#incusion").summernote({
  tabsize: 2,
  height: 120,
})

$("#fees").summernote({
  tabsize: 2,
  height: 120,
})

$("#termsCondition").summernote({
  tabsize: 2,
  height: 120,
})

$("#termsDayanamic").summernote({
  tabsize: 2,
  height: 120,
})

$("#planDetail").summernote({
  tabsize: 2,
  height: 120,
})


$("#hint").summernote({
  height: 100,
  toolbar: false,
  placeholder: "type with apple, orange, watermelon and lemon",
  hint: {
    words: ["apple", "orange", "watermelon", "lemon"],
    match: /\b(\w{1,})$/,
    search: function (keyword, callback) {
      callback(
        $.grep(this.words, function (item) {
          return item.indexOf(keyword) === 0
        })
      )
    },
  },
})
