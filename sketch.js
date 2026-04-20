let menus = 'exploration'.split('');
let nodes = [];
let mic; // p5.AudioIn
let micLevel = 0;
let wavePoints = []; // store wave y-values per x-step for collision
let waveStartX = 0;
const WAVE_STEP = 10;
const GRAVITY = 0.25;
const CONTENT_SIDE_PAD = 24;
const CONTENT_MAX_WIDTH = 1120;
const THEME = {
  midnight: '#16151D',
  pearl: '#F0E7D5',
  noir: '#000000',
  ocean: '#16151D'
};

// UI data
let images = {};
let uiFonts = {};
let profiles = [];
let cardW = 420;
let cardH = 140;
let padding = 24;

// interaction state
let hoverIndex = -1;
// visibleButtons[id] = { expiry: ms, alpha: 0 }
let visibleButtons = {};
let introOpen = false;
let introContent = '';
let introProfileId = null;
let closeButtonRect = null;
let currentPage = 'home';
let pageHeader = null;
let marginParticles = [];

const CONTACT_MAP_URL = 'https://tile.openstreetmap.org/15/28346/13066.png';

function setCurrentPage(pageKey){
  currentPage = pageKey;
  introOpen = false;
  introProfileId = null;
  introContent = '';
  closeButtonRect = null;
  visibleButtons = {};
  window.scrollTo(0, 0);
  if (currentPage !== 'home' && marginParticles.length === 0) {
    initMarginParticles();
  }
  updateTopNavState();
}

function updateTopNavState(){
  if (!pageHeader) return;
  const items = pageHeader.querySelectorAll('.top-nav-item');
  for (const el of items) {
    const key = el.getAttribute('data-page');
    if (key === currentPage) el.classList.add('active');
    else el.classList.remove('active');
  }
}

function ensurePageHeader(){
  if (pageHeader) return;
  document.body.style.background = THEME.midnight;
  if (!document.getElementById('sega-font-faces')) {
    const fontStyle = document.createElement('style');
    fontStyle.id = 'sega-font-faces';
    fontStyle.textContent = `
      @font-face { font-family: 'SegaLight'; src: url('fonts/3Light.ttf') format('truetype'); font-weight: 300; font-style: normal; }
      @font-face { font-family: 'SegaRegular'; src: url('fonts/4Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; }
      @font-face { font-family: 'SegaSemiBold'; src: url('fonts/6SemiBold.ttf') format('truetype'); font-weight: 600; font-style: normal; }
      @font-face { font-family: 'SegaExtraBold'; src: url('fonts/8ExtraBold.ttf') format('truetype'); font-weight: 800; font-style: normal; }
    `;
    document.head.appendChild(fontStyle);
  }

  if (!document.getElementById('sega-top-layout-style')) {
    const layoutStyle = document.createElement('style');
    layoutStyle.id = 'sega-top-layout-style';
    layoutStyle.textContent = `
      #site-header {
        position: relative;
        z-index: 3;
        background: ${THEME.midnight};
        color: ${THEME.pearl};
        padding: 14px 24px 10px 24px;
      }

      .top-shell {
        max-width: 1120px;
        margin: 0 auto;
      }

      .top-utility {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 0;
      }

      .top-utility-group {
        display: flex;
        align-items: center;
        gap: 0;
      }

      .top-university {
        margin: 0 0 3em 0;
        font-family: 'SegaLight', 'Segoe UI', sans-serif;
        font-size: clamp(13px, 1.1vw, 16px);
        line-height: 1;
        letter-spacing: 0.02em;
        color: ${THEME.pearl};
        cursor: pointer;
        user-select: none;
        transition: opacity 0.2s ease;
      }

      .top-university:hover {
        opacity: 0.8;
      }

      .top-hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 34px;
        cursor: pointer;
        user-select: none;
      }

      .top-brand-small {
        margin: 0;
        font-family: 'SegaRegular', 'Segoe UI', sans-serif;
        font-size: clamp(26px, 3.2vw, 48px);
        line-height: 0.95;
      }

      .top-brand-main {
        margin: 0;
        font-family: 'SegaExtraBold', 'Segoe UI', sans-serif;
        font-size: clamp(55px, 7.7vw, 107px);
        line-height: 0.9;
        letter-spacing: -0.04em;
        cursor: default;
        user-select: none;
      }

      .top-brand-main .brand-heavy {
        font-family: 'SegaExtraBold', 'Segoe UI', sans-serif;
      }

      .top-tagline {
        margin: 0;
        max-width: 520px;
        font-family: 'SegaRegular', 'Segoe UI', sans-serif;
        font-size: clamp(18px, 2.15vw, 44px);
        line-height: 1.14;
        letter-spacing: -0.01em;
        text-align: right;
        cursor: default;
        user-select: none;
      }

      .top-tagline em {
        font-family: 'SegaLight', 'Segoe UI', sans-serif;
        font-style: italic;
      }

      .top-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: clamp(12px, 2.4vw, 34px);
        margin: 20px -24px 0 -24px;
        padding: 3px 24px;
        background: ${THEME.midnight};
      }

      .top-nav-item {
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        padding: 3px 0;
        font-family: 'SegaSemiBold', 'Segoe UI', sans-serif;
        font-size: clamp(12px, 1.05vw, 15px);
        letter-spacing: 0.01em;
        color: ${THEME.pearl};
        opacity: 0.72;
        transition: opacity .2s ease;
      }

      .top-nav-item.active {
        opacity: 1;
      }

      .top-nav-item:hover {
        opacity: 0.94;
      }

      @media (max-width: 900px) {
        .top-hero {
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
        }

        .top-tagline {
          text-align: left;
          max-width: none;
        }

        .top-nav {
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 14px 20px;
        }
      }

      #site-footer-note {
        position: fixed;
        left: 50%;
        bottom: 14px;
        transform: translateX(-50%);
        font-family: 'SegaLight', 'Segoe UI', sans-serif;
        font-size: 11px;
        letter-spacing: 0.02em;
        color: rgba(240, 231, 213, 0.4);
        z-index: 20;
        pointer-events: none;
        white-space: nowrap;
        text-align: center;
        line-height: 1.4;
      }

      html {
        overflow-y: hidden !important;
        overflow-x: hidden !important;
      }

      body {
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }
    `;
    document.head.appendChild(layoutStyle);
  }

  const canvasContainer = document.getElementById('canvas-container');
  pageHeader = document.createElement('header');
  pageHeader.id = 'site-header';
  pageHeader.innerHTML = `
    <div class="top-shell">
      <div class="top-utility">
        <div class="top-utility-group">
          <p class="top-university">Duksung Women's University</p>
        </div>
      </div>

      <div class="top-hero">
        <div class="top-brand">
          <h1 class="top-brand-main">SEGA lab.</h1>
        </div>
        <p class="top-tagline">Sound Exploration &amp;<br>Generative Arts</p>
      </div>

      <div class="top-nav">
        <div class="top-nav-item active" data-page="home">Home</div>
        <div class="top-nav-item" data-page="members">Members</div>
        <div class="top-nav-item" data-page="gallery">Gallery</div>
        <div class="top-nav-item" data-page="publications">Publications</div>
        <div class="top-nav-item" data-page="contact">Contact</div>
      </div>
    </div>
  `;

  if (canvasContainer && canvasContainer.parentNode) {
    canvasContainer.parentNode.insertBefore(pageHeader, canvasContainer);
  } else {
    document.body.insertBefore(pageHeader, document.body.firstChild);
  }

  if (!document.getElementById('site-footer-note')) {
    const footerNote = document.createElement('div');
    footerNote.id = 'site-footer-note';
    footerNote.innerHTML = "Duksung Women's University<br>차352 SEGA Lab.";
    document.body.appendChild(footerNote);
  }

  const navItems = pageHeader.querySelectorAll('.top-nav-item[data-page]');
  navItems.forEach((item)=>{
    item.addEventListener('click', ()=>{
      const pageKey = item.getAttribute('data-page');
      if (pageKey) setCurrentPage(pageKey);
    });
  });

  const univLink = pageHeader.querySelector('.top-university');
  if (univLink) {
    univLink.addEventListener('click', (e)=>{
      e.stopPropagation();
      window.open('https://www.duksung.ac.kr', '_blank');
    });
  }

  const brandHero = pageHeader.querySelector('.top-hero');
  if (brandHero) {
    brandHero.addEventListener('click', (e)=>{
      e.stopPropagation();
      setCurrentPage('home');
    });
  };
  updateTopNavState();
}

function preload(){
  uiFonts.light = loadFont('fonts/3Light.ttf', ()=>{}, ()=>{ uiFonts.light = null; });
  uiFonts.regular = loadFont('fonts/4Regular.ttf', ()=>{}, ()=>{ uiFonts.regular = null; });
  uiFonts.semiBold = loadFont('fonts/6SemiBold.ttf', ()=>{}, ()=>{ uiFonts.semiBold = null; });
  uiFonts.extraBold = loadFont('fonts/8ExtraBold.ttf', ()=>{}, ()=>{ uiFonts.extraBold = null; });

  const files = { yklim: 'yklim.jpg', shim: 'bkshim.jpg', moon: 'mhmoon2.png', kim: 'yhkim.png', boti: 'boti.png', seo: 'shseo.jpg' };
  for(let k in files){
    images[k] = loadImage(files[k], ()=>{}, ()=>{ images[k]=null; });
  }
  images.contactImg = loadImage('Sega_contact.jpg', ()=>{}, ()=>{ images.contactImg = null; });
}

function setCanvasFont(weight){
  let fontObj = null;
  if (weight === 'light') fontObj = uiFonts.light;
  else if (weight === 'semiBold') fontObj = uiFonts.semiBold;
  else if (weight === 'extraBold') fontObj = uiFonts.extraBold;
  else fontObj = uiFonts.regular;

  if (fontObj) textFont(fontObj);
  else textFont('sans-serif');
}

function getContentBounds(){
  const available = max(0, windowWidth - CONTENT_SIDE_PAD * 2);
  const contentWidth = min(CONTENT_MAX_WIDTH, available);
  const left = CONTENT_SIDE_PAD + max(0, (available - contentWidth) / 2);
  return {
    left,
    width: contentWidth,
    right: left + contentWidth
  };
}

function getRequiredCanvasHeight(){
  if (currentPage === 'home') {
    return max(320, windowHeight - getHeaderHeight() - 6);
  }

  if (currentPage === 'contact') {
    const m = getContactPanelMetrics();
    return m.panelY + m.panelH + 24;
  }

  if (currentPage !== 'members') {
    return max(320, windowHeight - getHeaderHeight() - 6);
  }

  if (introProfileId) {
    const bounds = getContentBounds();
    const topPad = 20;
    const bottomPad = 22;
    const introW = getIntroCardTargetWidth(bounds);
    const introH = estimateIntroCardHeight(introW, introContent);
    return topPad + introH + bottomPad;
  }
  const columns = 2;
  const buttonReserve = 46;
  const rowGap = 14;
  const rowHeight = cardH + buttonReserve + rowGap;
  const py = 24 + 20;
  const startY = py + cardH + buttonReserve + rowGap;
  const studentCount = max(0, profiles.length - 1);
  const studentRows = max(1, ceil(studentCount / columns));
  const lastRowY = startY + (studentRows - 1) * rowHeight;
  const cardsBottom = lastRowY + cardH + buttonReserve + rowGap;
  return max(windowHeight, cardsBottom + 48);
}

function getHeaderHeight(){
  return pageHeader ? pageHeader.offsetHeight : 0;
}

function ensureCanvasHeight(){
  const requiredHeight = getRequiredCanvasHeight();
  if (abs(height - requiredHeight) > 1) {
    resizeCanvas(windowWidth, requiredHeight);
  }
}

function getIntroCardTargetWidth(bounds){
  return min(bounds.width - 34, 860);
}

function estimateIntroCardHeight(cardWidth, content){
  const text = content || '';
  const bodyW = max(220, cardWidth - 48);
  const avgCharPx = 7.2;
  let lines = 0;
  const chunks = text.split('\n');
  for (const chunk of chunks) {
    if (chunk.trim().length === 0) {
      lines += 1;
      continue;
    }
    lines += max(1, ceil((chunk.length * avgCharPx) / bodyW));
  }
  const textBlockH = lines * 20;
  const fixedHeaderH = 172;
  const bottomPadding = 26;
  return ceil(fixedHeaderH + textBlockH + bottomPadding);
}

function initMarginParticles(){
  marginParticles = [];
  const count = 72;
  const bounds = getContentBounds();
  for (let i = 0; i < count; i++) {
    const side = random() < 0.5 ? 'left' : 'right';
    const marginWidth = max(14, side === 'left' ? bounds.left : width - bounds.right);
    const xMin = side === 'left' ? 2 : width - marginWidth + 2;
    const xMax = side === 'left' ? bounds.left - 6 : width - 2;
    marginParticles.push({
      side,
      x: random(xMin, max(xMin + 1, xMax)),
      y: random(0, height),
      vy: random(0.25, 0.8),
      seed: random(1000),
      len: random(8, 18),
      alpha: random(18, 52)
    });
  }
}

function drawMarginParticles(){
  if (currentPage === 'home') return;
  if (marginParticles.length === 0) initMarginParticles();

  const bounds = getContentBounds();
  const amp = constrain(map(micLevel, 0, 0.3, 0, 1), 0, 1);
  noStroke();

  for (let p of marginParticles) {
    const leftMargin = max(12, bounds.left - 4);
    const rightMarginStart = min(width - 12, bounds.right + 4);

    if (p.side === 'left') {
      p.x = constrain(p.x + sin(frameCount * 0.02 + p.seed) * 0.18, 2, leftMargin);
    } else {
      p.x = constrain(p.x + sin(frameCount * 0.02 + p.seed) * 0.18, rightMarginStart, width - 2);
    }

    p.y += p.vy + amp * 0.62;
    if (p.y > height + 20) {
      p.y = -random(10, 90);
      p.seed = random(1000);
      p.alpha = random(28, 80);
    }

    const scaleAmp = 0.8 + amp * 1.8;
    const baseSize = 3.2;
    const size = baseSize * scaleAmp;
    const dx = sin(frameCount * 0.03 + p.seed) * (1.2 + amp * 3.6);
    const opacity = p.alpha * (0.6 + amp * 0.4);
    fill(240, 231, 213, opacity);
    ellipse(p.x + dx, p.y, size, size);
  }
}

function getContactPanelMetrics(){
  const bounds = getContentBounds();
  const panelW = min(bounds.width - 120, 760);
  const panelX = bounds.left + (bounds.width - panelW) / 2;
  const panelY = 24;
  const availableH = max(280, windowHeight - getHeaderHeight() - 70);
  
  let mapH = constrain(availableH - 160, 180, 300);
  
  // Adjust mapH based on contact image aspect ratio at 48% width
  if (images.contactImg && images.contactImg.width && images.contactImg.height) {
    const imgW = (panelW - 48) * 0.528;
    const imgAspectRatio = images.contactImg.width / images.contactImg.height;
    mapH = imgW / imgAspectRatio;
  }
  
  const panelH = mapH + 160;
  return { panelW, panelX, panelY, mapH, panelH };
}

// draw an image clipped to a circle of given size at (x,y)
function drawCircularImage(img, x, y, size, crop){
  push();
  // use canvas clipping so the image itself is drawn circular
  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  imageMode(CORNER);
  if (img) {
    if (crop && typeof crop.sx === 'number'){
      // draw with source cropping: image(img, sx, sy, sw, sh, dx, dy, dw, dh)
      let sx = crop.sx, sy = crop.sy, sw = crop.sw, sh = crop.sh;
      // ensure integer bounds
      sx = max(0, sx); sy = max(0, sy);
      sw = Math.floor(max(1, min(img.width - sx, sw)));
      sh = Math.floor(max(1, min(img.height - sy, sh)));
      // if crop area is too small (or invalid) fall back to full-image draw
      if (sw < 20 || sh < 20) {
        image(img, x, y, size, size);
      } else {
        image(img, x, y, size, size, sx, sy, sw, sh);
      }
    } else {
      image(img, x, y, size, size);
    }
  }
  else {
    noStroke(); fill(120); rect(x, y, size, size);
    fill(255); textAlign(CENTER, CENTER); textSize(12);
    text('No Image', x + size/2, y + size/2);
  }
  ctx.restore();
  pop();
}

function buildSquareCoverCrop(img, biasX, biasY, scaleFactor){
  if (!img || !img.width || !img.height) return null;
  const sideBase = min(img.width, img.height);
  const side = floor(sideBase * (scaleFactor || 1));
  const clampedSide = constrain(side, 1, sideBase);
  const bx = typeof biasX === 'number' ? biasX : 0.5;
  const by = typeof biasY === 'number' ? biasY : 0.5;
  const sx = floor((img.width - clampedSide) * bx);
  const sy = floor((img.height - clampedSide) * by);
  return {
    sx: constrain(sx, 0, img.width - clampedSide),
    sy: constrain(sy, 0, img.height - clampedSide),
    sw: clampedSide,
    sh: clampedSide
  };
}

function setup() {
  ensurePageHeader();
  createCanvas(windowWidth, windowHeight).parent('canvas-container');
  mic = new p5.AudioIn();
  mic.start();
  initMarginParticles();

  profiles = [
    { id:'prof', name:'임양규', title:'가상현실융합학과 교수', email:'trumpetyk09@duksung.ac.kr', img: images.yklim, type:'professor' },
    { id:'shim', name:'심보광', title:'박사과정', email:'galent@duksung.ac.kr', img: images.shim, type:'student' },
    { id:'moon', name:'문민혜', title:'석사과정', email:'minhyemoon@duksung.ac.kr', img: images.moon, type:'student' },
    { id:'kim', name:'김영한', title:'석사과정', email:'', img: images.kim, type:'student' },
    { id:'boti', name:'보티존', title:'석사과정', email:'botirjonabdulvoxidov@gmail.com', img: images.boti, type:'student' },
    { id:'seo', name:'서수현', title:'석사과정', email:'watermu@duksung.ac.kr', img: images.seo, type:'student' }
  ];

  for (let i = 0; i < menus.length; i++) {
    nodes.push(new MenuNode(random(60, windowWidth - 60), random(-220, -40), menus[i]));
  }
}

function draw() {
  ensureCanvasHeight();
  background(THEME.midnight);

  micLevel = mic ? mic.getLevel() : 0;

  if (currentPage === 'home') {
    drawBackgroundWave();
    for (let node of nodes) {
      node.update();
    }
    for (let node of nodes) {
      node.display();
    }
    separateNodes();
  } else {
    wavePoints = [];
    drawMarginParticles();
  }

  if (currentPage === 'members') {
    layoutCards();
  } else if (currentPage !== 'home') {
    drawPlaceholderPage();
  }
}

function drawPlaceholderPage(){
  if (currentPage === 'contact') {
    drawContactPage();
    return;
  }

  if (currentPage === 'publications') {
    drawPublicationsPage();
    return;
  }

  const bounds = getContentBounds();
  const panelW = min(bounds.width - 10, 920);
  const panelH = min(height - 94, 360);
  const x = bounds.left + (bounds.width - panelW) / 2;
  const y = 24;

  noStroke();
  fill(240, 231, 213, 242);
  rect(x, y, panelW, panelH, 16);

  fill(22, 21, 29);
  setCanvasFont('extraBold');
  textAlign(LEFT, TOP);
  textSize(34);
  const titleMap = {
    home: 'Home',
    gallery: 'Gallery',
    publications: 'Publications',
    contact: 'Contact'
  };
  text(titleMap[currentPage] || 'Page', x + 28, y + 24);

  setCanvasFont('regular');
  textSize(15);
  fill(22, 21, 29, 180);
  text('This section is being prepared.\nMembers currently contains the profile cards and interactions.', x + 28, y + 78);
}

function drawContactPage(){
  const m = getContactPanelMetrics();
  const panelW = m.panelW;
  const panelX = m.panelX;
  const panelY = m.panelY;
  const mapH = m.mapH;
  const panelH = m.panelH;

  noStroke();
  fill(240, 231, 213, 242);
  rect(panelX, panelY, panelW, panelH, 14);

  fill(22, 21, 29);
  setCanvasFont('extraBold');
  textAlign(LEFT, TOP);
  textSize(26);
  text('Welcome to SEGA', panelX + 24, panelY + 25);

  const imgDisplayW = (panelW - 48) * 0.528;
  const mapY = panelY + 79;
  const imgX = panelX + (panelW - imgDisplayW) / 2;

  let imgDisplayH = mapH;
  // Display contact image with aspect ratio preserved
  if (images.contactImg) {
    if (images.contactImg.width && images.contactImg.height) {
      const imgAspectRatio = images.contactImg.width / images.contactImg.height;
      imgDisplayH = imgDisplayW / imgAspectRatio;
    }
    imageMode(CORNER);
    image(images.contactImg, imgX, mapY, imgDisplayW, imgDisplayH);
  }

  // Text below image
  fill(22, 21, 29, 200);
  setCanvasFont('regular');
  textLeading(10);
  textAlign(CENTER, TOP);
  textSize(13);
  text('서울특별시 도봉구 삼양로 144길 33 덕성여자대학교\n\n차미리사관 352호', panelX + panelW / 2, mapY + imgDisplayH + 20);
}

function drawMapPlaceholder(x, y, w, h){
  // Draw gradient-like map background
  noStroke();
  fill(200, 210, 220);
  rect(x, y, w, h, 8);
  
  // Add map-like grid pattern
  stroke(180, 190, 200);
  strokeWeight(1);
  const gridSize = 40;
  for (let i = 0; i * gridSize < w; i++) {
    line(x + i * gridSize, y, x + i * gridSize, y + h);
  }
  for (let j = 0; j * gridSize < h; j++) {
    line(x, y + j * gridSize, x + w, y + j * gridSize);
  }
  
  // Add marker pin
  noStroke();
  fill(220, 60, 60);
  const pinX = x + w * 0.35;
  const pinY = y + h * 0.45;
  ellipse(pinX, pinY, 16, 16);
  fill(240, 231, 213);
  ellipse(pinX, pinY, 6, 6);
  
  // Add location label
  setCanvasFont('semiBold');
  textSize(13);
  fill(60, 60, 80);
  textAlign(LEFT, TOP);
  text('Duksung Univ.', pinX + 20, pinY - 12);
}

function drawPublicationsPage(){
  const bounds = getContentBounds();
  const panelW = min(bounds.width - 10, 920);
  const panelX = bounds.left + (bounds.width - panelW) / 2;
  const panelY = 24;
  const panelH = min(height - 94, 680);

  noStroke();
  fill(240, 231, 213, 242);
  rect(panelX, panelY, panelW, panelH, 14);

  fill(22, 21, 29);
  setCanvasFont('extraBold');
  textAlign(LEFT, TOP);
  textSize(32);
  text('Publications', panelX + 24, panelY + 20);

  setCanvasFont('semiBold');
  textAlign(LEFT, TOP);
  textSize(18);
  fill(22, 21, 29, 220);
  text('임양규 교수 - Google Scholar', panelX + 24, panelY + 74);

  setCanvasFont('regular');
  textSize(14);
  fill(22, 21, 29, 180);
  textLeading(22);
  const scholarLink = 'Scholar Profile: https://scholar.google.com/citations?hl=ko&user=Abd4YukAAAAJ&view_op=list_works';
  const publicationText = 'Recent publications and research works are available on the Google Scholar profile.\n\nTopics include:\n- Computer-based Music Conducting\n- Sound Programming & Audio Processing\n- Generative Arts & Interactive Media\n- Traditional Music Digitalization\n- VR & Immersive Technologies';
  text(publicationText, panelX + 24, panelY + 108, panelW - 48, panelH - 160);

  fill(240, 231, 213, 210);
  textSize(13);
  setCanvasFont('light');
  text(scholarLink, panelX + 24, panelY + panelH - 50, panelW - 48);
}

function separateNodes(){
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      let a = nodes[i];
      let b = nodes[j];
      let minDist = (a.size + b.size)/2 + 6; // small gap
      let d = p5.Vector.dist(a.pos, b.pos);
      if(d < minDist){
        if(d < 0.001){
          let jitter = createVector(random(-1,1), random(-1,1)).mult(2);
          a.pos.add(jitter);
          d = p5.Vector.dist(a.pos, b.pos);
        }
        let overlap = minDist - d;
        let dir = p5.Vector.sub(a.pos, b.pos).normalize();
        let push = dir.mult(overlap * 0.5);
        a.pos.add(push);
        b.pos.sub(push);
        a.vel.add(push.copy().mult(0.08));
        b.vel.sub(push.copy().mult(0.08));
      }
    }
  }
}

class MenuNode {
  constructor(x, y, label) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.6, 0.6), random(1, 3));
    this.label = label;
    this.size = 50;
    this.isHovered = false;
    this.rotation = random(TWO_PI);
  }

  update() {
    const bounds = { left: 0, right: width };
    let mousePos = createVector(constrain(mouseX, 0, width), constrain(mouseY, 0, height));
    let d = p5.Vector.dist(this.pos, mousePos);
    const avoidRadius = 120;
    if (d < avoidRadius) {
      let away = p5.Vector.sub(this.pos, mousePos);
      away.setMag((avoidRadius - d) / avoidRadius * 2.5);
      this.vel.add(away);
    }

    this.vel.y += GRAVITY;
    this.pos.add(this.vel);
    this.vel.limit(8);

    if (wavePoints && wavePoints.length > 0) {
      let xi = floor((this.pos.x - waveStartX) / WAVE_STEP);
      xi = constrain(xi, 0, wavePoints.length - 1);
      let wy = wavePoints[xi];
      if (wy !== undefined) {
        let distToWave = this.pos.y - wy;
        if (abs(distToWave) < this.size / 2) {
          this.pos.y = wy - this.size / 2 - 1;
          this.vel.y = -max(1.2, abs(this.vel.y)) * 0.85;
          this.vel.x += random(-0.8, 0.8);
        }
      }
    }

    if (this.pos.x < bounds.left + 50) { this.pos.x = bounds.left + 50; this.vel.x *= -1; }
    if (this.pos.x > bounds.right - 50) { this.pos.x = bounds.right - 50; this.vel.x *= -1; }

    const bottomLimit = height * 0.7;
    if (this.pos.y > bottomLimit) {
      this.pos.y = bottomLimit;
      if (abs(this.vel.y) < 0.8) this.vel.y = -random(2.2, 4.2);
      else this.vel.y = -abs(this.vel.y) * 0.7;
      this.vel.x *= 0.9;
    }

    if (this.pos.y < -120) { this.pos.y = -120; this.vel.y = 0.1; }
    this.vel.mult(0.995);
    
    // Update rotation based on velocity
    const speed = sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
    this.rotation += speed * 0.05;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    textAlign(CENTER, CENTER);
    fill(THEME.pearl);
    noStroke();
    setCanvasFont('semiBold');
    textSize(26);
    text(this.label, 0, 0);
    pop();
  }
}

function drawBackgroundWave() {
  const left = 0;
  const right = width;
  let amp = constrain(map(micLevel, 0, 0.3, 0, 1), 0, 1);
  let sway = amp * 700;

  stroke(240, 231, 213, 80);
  noFill();
  wavePoints = [];
  waveStartX = left;
  beginShape();
  for (let x = left; x <= right; x += WAVE_STEP) {
    let base = noise(x * 0.005, frameCount * 0.01) * height * 0.5 + height * 0.25;
    let wave = sin((x * 0.02) + frameCount * 0.06) * sway;
    let y = base + wave;
    vertex(x, y);
    wavePoints.push(y);
  }
  endShape();
}

function layoutCards(){
  const bounds = getContentBounds();
  // responsive card size: keep two cards per row across the design content width
  const gap = 18;
  const columns = bounds.width < 860 ? 1 : 2;
  const availableW = bounds.width - (columns - 1) * gap;
  const idealColW = floor(availableW / columns);
  cardW = columns === 1 ? min(idealColW, 620) : idealColW;
  cardH = 160; // increased from 140
  padding = 24;
  const buttonReserve = 52;
  const rowGap = 14;
  const rowHeight = cardH + buttonReserve + rowGap;

  // compute base positions
  let px = columns === 1 ? bounds.left + (bounds.width - cardW) / 2 : bounds.left;
  let py = padding + 20;
  let startY = py + cardH + buttonReserve + rowGap;
  let x = columns === 1 ? px : bounds.left;
  let y = startY;
  let basePos = {};
  basePos[profiles[0].id] = { x: px, y: py, w: cardW, h: cardH };
  for(let i=1;i<profiles.length;i++){
    basePos[profiles[i].id] = { x, y, w: cardW, h: cardH };
    x += cardW + gap;
    if (x + cardW > bounds.right){ x = columns === 1 ? px : bounds.left; y += rowHeight; }
  }

  const focusMode = !!introProfileId;
  closeButtonRect = null;
  const focusDrawOrder = focusMode ? profiles : profiles.slice(1).concat(profiles[0]);

  for (let p of focusDrawOrder) {
    const base = basePos[p.id];
    if (!base) continue;

    let tx = base.x;
    let ty = base.y;
    let tw = base.w;
    let th = base.h;
    let ta = 255;

    if (focusMode) {
      if (p.id === introProfileId) {
        const topPad = 20;
        const bottomPad = 22;
        tw = getIntroCardTargetWidth(bounds);
        ty = topPad;
        const idealH = estimateIntroCardHeight(tw, introContent);
        const maxH = max(290, height - topPad - bottomPad);
        th = constrain(idealH, 290, maxH);
        tx = bounds.left + (bounds.width - tw) / 2;
      } else {
        const dir = (base.x + base.w * 0.5 < width * 0.5) ? -1 : 1;
        tx = dir < 0 ? -base.w - 140 : width + 140;
        ty = base.y;
        ta = 0;
      }
    }

    if (!p._animCard) {
      p._animCard = { x: tx, y: ty, w: tw, h: th, alpha: ta };
    }

    const speed = focusMode ? 0.18 : 0.22;
    p._animCard.x = lerp(p._animCard.x, tx, speed);
    p._animCard.y = lerp(p._animCard.y, ty, speed);
    p._animCard.w = lerp(p._animCard.w, tw, speed);
    p._animCard.h = lerp(p._animCard.h, th, speed);
    p._animCard.alpha = lerp(p._animCard.alpha, ta, speed);

    if (p._animCard.alpha > 2) {
      drawCard(
        p,
        p._animCard.x,
        p._animCard.y,
        p._animCard.w,
        p._animCard.h,
        p._animCard.alpha,
        focusMode && p.id === introProfileId,
        focusMode
      );
    } else {
      p._buttons = [];
    }
  }
}

function drawCard(p, x, y, w, h, alpha, isFocused, focusMode){
  // save rect for interaction
  p._x = x; p._y = y; p._w = w; p._h = h;
  const cardAlpha = constrain(alpha, 0, 255);

  push();
  // navy card by default, cream style when intro is focused
  noStroke();
  if (isFocused) {
    fill(240, 231, 213, cardAlpha);
    rect(x, y, w, h, 8);
  } else {
    fill(0, 0, 0, 0);
    rect(x, y, w, h, 12);
  }

  // photo area (circular)
  let imgSize = isFocused ? 128 : ((p.type==='professor')?116:105);
  let ix = x + (isFocused ? 24 : 18);
  let iy = isFocused ? (y + 24) : (y + (h - imgSize)/2);
  let cx = ix + imgSize/2; let cy = iy + imgSize/2;
  fill(22, 21, 29, isFocused ? (40 * (cardAlpha / 255)) : 120); noStroke(); ellipse(cx, cy, imgSize, imgSize);
  // for specific profiles we can pass a crop region so the important area is shown
  // 김영한은 기존 대비 20% 더 타이트하게, 얼굴 위치(약간 오른쪽/아래)에 맞춘 정사각형 크롭 사용
  tint(255, cardAlpha);
  if (p.id === 'kim' && p.img && p.img.width && p.img.height) {
    if (!p._kimCrop) {
      p._kimCrop = buildSquareCoverCrop(p.img, 0.58, 0.28, 0.67);
    }
    drawCircularImage(p.img, ix, iy, imgSize, p._kimCrop);
  } else {
    if (!p._squareCrop) {
      let biasX = 0.5;
      let biasY = 0.5;
      let scaleFactor = 1;
      if (p.id === 'moon') {
        scaleFactor = 0.95;
        biasY = 0.43;
      } else if (p.id === 'seo') {
        biasY = 0.43;
      }
      p._squareCrop = buildSquareCoverCrop(p.img, biasX, biasY, scaleFactor);
    }
    drawCircularImage(p.img, ix, iy, imgSize, p._squareCrop);
  }
  noTint();
  // photo border (circle)
  if (isFocused) stroke(22, 21, 29, 100 * (cardAlpha / 255));
  else if (p.type === 'professor') stroke(240, 231, 213, 95 * (cardAlpha / 255));
  else stroke(240, 231, 213, 100 * (cardAlpha / 255));
  noFill(); strokeWeight(2); ellipse(cx, cy, imgSize, imgSize);
  noStroke();

  // text
  textAlign(LEFT, TOP);
  let tx = ix + imgSize + (isFocused ? 22 : 24);
  let ty = y + (isFocused ? 26 : 20);
  setCanvasFont('semiBold');
  if (isFocused) fill(22, 21, 29, cardAlpha);
  else fill(240, 231, 213, cardAlpha);
  if (isFocused) textSize((p.type === 'professor') ? 28 : 24);
  else if (p.type === 'professor') { textSize(24); }
  else { textSize(20); }
  text(p.name, tx, ty);
  setCanvasFont('regular');
  textSize(isFocused ? 16 : 15);
  if (isFocused) fill(22, 21, 29, 180 * (cardAlpha / 255));
  else fill(240, 231, 213, 205 * (cardAlpha / 255));
  text(p.title, tx, ty + ((p.type==='professor')?42:38));
  setCanvasFont('light');
  textSize(isFocused ? 14 : 13);
  if (isFocused) fill(22, 21, 29, 160 * (cardAlpha / 255));
  else fill(240, 231, 213, 175 * (cardAlpha / 255));
  text(p.email, tx, ty + ((p.type==='professor')?66:60));

  if (isFocused) {
    const bodyX = x + 24;
    const bodyY = y + 154;
    const bodyW = w - 48;
    const bodyH = h - 168;
    setCanvasFont('regular');
    textAlign(LEFT, TOP);
    textSize(14);
    textLeading(20);
    fill(22, 21, 29, 210 * (cardAlpha / 255));
    text(introContent, bodyX, bodyY, bodyW, bodyH);

    const closeSize = 28;
    const closeX = x + w - closeSize - 12;
    const closeY = y + 10;
    setCanvasFont('semiBold');
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(22, 21, 29, cardAlpha);
    text('X', closeX + closeSize / 2, closeY + closeSize / 2 + 1);
    closeButtonRect = { x: closeX, y: closeY, w: closeSize, h: closeSize };
    p._buttons = [];
    pop();
    return;
  }

  if (focusMode) {
    p._buttons = [];
    pop();
    return;
  }

  // hover detection -> extend expiry
  if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h){
    hoverIndex = profiles.indexOf(p);
    if (!visibleButtons[p.id]) visibleButtons[p.id] = { expiry: millis() + 2000, alpha: 0 };
    else visibleButtons[p.id].expiry = millis() + 2000;
  } else {
    if (!visibleButtons[p.id]) visibleButtons[p.id] = { expiry: 0, alpha: 0 };
  }

  // update alpha for this card's buttons (fade in/out)
  let vb = visibleButtons[p.id];
  if (vb) {
    let target = (vb.expiry > millis())?255:0;
    if (vb.alpha < target) vb.alpha = min(255, vb.alpha + 28);
    if (vb.alpha > target) vb.alpha = max(0, vb.alpha - 28);
    if (vb.alpha > 5) drawButtons(p, x, y, w, h, min(vb.alpha, cardAlpha));
    else p._buttons = [];
  }

  pop();
}

function drawButtons(p, x, y, w, h, alpha){
  push();
  let imgSize = (p.type === 'professor') ? 116 : 105;
  let bx = x + 18 + imgSize + 24 - 2;
  let bh = 30; let bgap = 6;
  let padX = 7;
  let emailY = y + 30 + ((p.type === 'professor') ? 66 : 60);
  let by = min(y + h - bh - 8, emailY + 15);
  let buttons = (p.type === 'professor')?['Profile','Google Scholar','YouTube']:['Profile','연구업적'];
  p._buttons = p._buttons || [];
  setCanvasFont('semiBold');
  textSize(12);
  textAlign(CENTER, CENTER);
  let cx = bx;
  for(let i=0;i<buttons.length;i++){
    let bw = ceil(textWidth(buttons[i]) + padX * 2);
    let rx = cx;
    fill(14, 13, 20, alpha);
    noStroke();
    rect(rx, by, bw, bh, 10);
    fill(240, 231, 213, alpha);
    text(buttons[i], rx + bw/2, by + bh/2);
    p._buttons[i] = { x: rx, y: by, w: bw, h: bh, label: buttons[i] };
    cx += bw + bgap;
  }
  pop();
}

function drawIntroPanel(){
  push();
  let W = min(680, width - 80);
  let H = min(420, height - 160);
  let x = (width - W)/2; let y = (height - H)/2;
  fill(22, 21, 29, 238); rect(x, y, W, H, 14);
  setCanvasFont('regular');
  textLeading(22);
  fill(THEME.pearl); textSize(16); textAlign(LEFT, TOP);
  text(introContent, x + 24, y + 24, W - 48, H - 80);
  // close button
  let cx = x + W - 96; let cy = y + H - 56; fill(22, 21, 29); stroke(240, 231, 213, 170); strokeWeight(1); rect(cx, cy, 72, 36, 8);
  noStroke();
  setCanvasFont('semiBold');
  fill(240, 231, 213); textAlign(CENTER, CENTER); text('닫기', cx + 36, cy + 18);
  pop();
}

function mousePressed(){
  if (introProfileId) {
    if (
      closeButtonRect &&
      mouseX >= closeButtonRect.x && mouseX <= closeButtonRect.x + closeButtonRect.w &&
      mouseY >= closeButtonRect.y && mouseY <= closeButtonRect.y + closeButtonRect.h
    ) {
      introProfileId = null;
      introContent = '';
      closeButtonRect = null;
    }
    return;
  }

  // check buttons on visible cards
  for(let p of profiles){
    if (p._buttons){
      for(let b of p._buttons){
        if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h){
          // handle action
          if (b.label === 'Profile'){
            introOpen = false;
            introProfileId = p.id;
            visibleButtons = {};
            window.scrollTo(0, 0);
            if (p.id === 'prof') {
              introContent = `임양규 교수\n연구실 대표 교수\n\nEducation:\n2015-2020 Chung-Ang University, Seoul, South Korea, Ph.D. in Film and Media Studies (중앙대학교 첨단영상대학원, 영상학박사)\n2007-2015 KAIST, Daejeon, South Korea, Master of Science (카이스트 문화기술대학원, 공학석사)\n2004-2007 University of Music Franz Liszt Weimar, Germany, Pädagogisches Diplom (Master of Music in Education) in Classical Trumpet (독일 국립 리스트 음악원, 교육학 석사)\n2002-2004 University of Music Franz Liszt Weimar, Germany, Vordiplom (Pre-Diploma in Music) in Classical Trumpet (독일 국립 리스트 음악원, 음악 학사)\n2001- Korean National University of Art, Major in Trumpet (한국예술종합학교 음악원 기악과)\n\nResearch and Development:\n- Global Ph.D. Fellowship - Ministry of Education, Science and Technology (Apr. 2015 - Mar. 2018)\n- Subject: Computer-based Music Conducting\n- Chung-Ang University Hospital (Sep. 2014 - Mar. 2015) - Subject: Development of Game Analysis Model for Serious Games\n- KAIST (Apr. 2012 - Mar. 2014) - Subject: Standardization of Recording Techniques and Development of Composition/Arrangement Tools for Korean Traditional Instruments\n- Development of Korean traditional music score digitalization program and MusicXML conversion tools\n\nCourse Instructor:\n- Sungkyunkwan University, Seoul, Korea: Art Technology 1 (Mar. 2020 - Present)\n- Chung-Ang University, Seoul, Korea: 3D Video Design, Sound Programming, Physical Computing (Mar. 2016 - Present)\n\nPerformance & Exhibition Highlights:\n- Music Skyline — SIGGRAPH 2018\n- Ars Electronica - Out of the Box (TechiEon)\n- Various concerts and collaborative performances (KBS, Seoul, international venues)\n\nContact: trumpetyk09@duksung.ac.kr`;
            } else if (p.id === 'moon') {
              introContent = `문민혜 — 석사과정\n\n소속: 석사과정\n관심분야: 인터랙티브 미디어, 3D 비주얼, 사운드 프로그래밍\n연구주제: 미디어 아트에서의 사운드-비주얼 상호작용과 인터랙션 디자인\n학력/경력 요약: 관련 프로젝트 및 전시 다수 참여\nContact: minhyemoon@duksung.ac.kr`;
            } else if (p.id === 'seo') {
              introContent = `서수현 — 석사과정\n\n관심분야: 미디어 디자인, 사용자 경험\n연구주제: 인터랙션 디자인 기반 프로젝트\nContact: watermu@duksung.ac.kr`;
            } else if (p.id === 'shim') {
              introContent = '심보광 — 박사과정\n\n(프로필 내용)';
            } else {
              introContent = p.name + '\n\n(프로필 내용 없음)';
            }
            return;
          } else if (b.label === '연구업적'){
            if (p.id === 'shim') window.open('https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002914157','_blank');
            else if (p.id === 'boti') window.open('https://www.earticle.net/Article/A474319','_blank');
            else if (p.id === 'seo') window.open('https://scholar.google.com/citations?hl=ko&user=FsV6clgAAAAJ','_blank');
            else window.open('#','_blank');
            return;
          } else if (b.label === 'Google Scholar'){
            if (p.id === 'seo') window.open('https://scholar.google.com/citations?hl=ko&user=FsV6clgAAAAJ','_blank');
            else if (p.id === 'prof') window.open('https://scholar.google.com/citations?hl=ko&user=Abd4YukAAAAJ&view_op=list_works','_blank');
            else window.open('#','_blank');
            return;
          } else if (b.label === 'YouTube'){
            if (p.id === 'prof') window.open('https://www.youtube.com/@Professor_Bravissimo_Parlalote/shorts','_blank');
            else window.open('#','_blank');
            return;
          }
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initMarginParticles();
  ensureCanvasHeight();
}