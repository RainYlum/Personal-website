let indexType = 0;

const typeChangeButton = document.querySelector('.type-change-button');




// 通过模板加载内容
function loadTemplate(templateId, containerId) {
  const template = document.getElementById(templateId);
  const clone = document.importNode(template.content, true);
  document.getElementById(containerId).appendChild(clone);
}


function changeAudioType(type) {

}

function changeBannerType(type) {
  banner = document.querySelector('.banner-img');
  if (type == 0) {
    banner.src = './assets/img/banner-airi.png';
  } else if (type == 1) {
    banner.src = './assets/img/banner-ena.png';
  } else if (type == 2) {
    banner.src = './assets/img/banner-mzk.png';
  } else if (type == 3) {
    banner.src = './assets/img/banner-mnr.png';
  } else {
    banner.src = './assets/img/banner-chuni.png';
  }
}

function changeContentType(type) {

}

function changeIndexType(type) {
  indexType = type;
  changeAudioType(type);
  changeBannerType(type);
  changeContentType(type);
}


typeChangeButton.addEventListener('click', function () {
  if (indexType == 3) {
    indexType = -1;
  }
  changeIndexType(indexType + 1);
})

changeBannerType(0)