(() => {
  'use strict';

  /* ---------------- year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- theme toggle ---------------- */
  const root = document.documentElement;
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  let theme = 'dark';

  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  if (prefersLight) theme = 'light';
  applyTheme(theme);

  function applyTheme(t){
    theme = t;
    root.setAttribute('data-theme', t);
    body.setAttribute('data-theme', t);
  }

  themeToggle && themeToggle.addEventListener('click', () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  });

  /* ---------------- nav scroll state ---------------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- mobile dropdown menu ---------------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  function closeMenu(){
    navLinks.classList.remove('open');
    menuToggle.classList.remove('open');
  }

  menuToggle && menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
  });
  navLinks && navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && e.target !== menuToggle) {
      closeMenu();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------------- active section highlight ---------------- */
  const sections = ['home', 'about', 'work', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navAnchors = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => a.classList.toggle('active', a.dataset.nav === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => sectionObserver.observe(s));

  /* ---------------- scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------- hero parallax (mouse-follow depth) ---------------- */
  const portraitStage = document.getElementById('portraitStage');
  const portraitFrame = document.getElementById('portraitFrame');
  const hero = document.getElementById('home');
  let rafId = null;
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hero && !reduceMotion) {
    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
    hero.addEventListener('pointerleave', () => {
      targetX = 0; targetY = 0;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
  }

  function tick(){
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;

    if (portraitFrame) portraitFrame.style.transform = `rotateY(${curX * 6}deg) rotateX(${-curY * 6}deg)`;
    if (portraitStage) portraitStage.style.transform = `translate(${curX * 8}px, ${curY * 8}px)`;

    if (Math.abs(curX - targetX) > 0.001 || Math.abs(curY - targetY) > 0.001) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  /* ---------------- work card tilt ---------------- */
  const tiltCards = document.querySelectorAll('[data-tilt]');
  if (!reduceMotion) {
    tiltCards.forEach(card => {
      let cardRaf = null, cx = 0, cy = 0;
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        cx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        cy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        if (!cardRaf) cardRaf = requestAnimationFrame(() => {
          card.style.transform = `perspective(800px) rotateY(${cx * 4}deg) rotateX(${-cy * 4}deg) translateY(-4px)`;
          cardRaf = null;
        });
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)';
      });
    });
  }

  /* ---------------- back to top (floating fab) ---------------- */
  const toTop = document.getElementById('toTop');
  const toTopThreshold = () => window.innerHeight * 0.5;
  const onScrollToTop = () => {
    if (window.scrollY > toTopThreshold()) toTop.classList.add('show');
    else toTop.classList.remove('show');
  };
  window.addEventListener('scroll', onScrollToTop, { passive: true });
  onScrollToTop();
  toTop && toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------------- toast ---------------- */
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;
  function showToast(msg){
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ---------------- copy to clipboard ---------------- */
  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', async () => {
      const text = el.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied ' + text);
      } catch (err) {
        // fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast('Copied ' + text); }
        catch (e2) { showToast('Copy this: ' + text); }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------------- modal content ---------------- */
  const modalData = {
    pressrelease: {
      tag: 'Writing Sample &middot; Appendix D of the Huda Beauty Media Relations Plan',
      title: 'Press Release · Beauty Beyond Borders',
      className: 'doc-type-letter',
      body: `
        <h5>From the presentation deck</h5>
        <div class="deck-slider" id="mmrSlider">
          <div class="deck-slide-viewport">
            <button class="deck-arrow prev" id="deckPrev" aria-label="Previous slide">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <img class="deck-slide-img" id="deckSlideImg" src="" alt="">
            <button class="deck-arrow next" id="deckNext" aria-label="Next slide">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <div class="deck-slider-foot">
            <div class="deck-dots" id="deckDots"></div>
            <span class="deck-counter" id="deckCounter">1 / 11</span>
          </div>
        </div>
        <p class="deck-caption">Tap a slide to view it full size.</p>
        <hr class="gallery-divider">
        <p style="text-transform:uppercase;letter-spacing:.08em;font-size:12px;color:var(--text-2);font-weight:700;">For Immediate Release</p>
        <p class="pr-headline">Huda Beauty Cares: The Beloved Makeup Brand Launches a New Initiative to Help Those Impacted by Conflict</p>
        <p><span class="pr-dateline">NEW YORK (MAY 5)</span>- Huda Beauty, the makeup giant, proves once again that they are much more than the foundation and powders. Huda Beauty&rsquo;s founder, Huda Kattan, has never been shy about her political stance, and advocating for the causes that she believes, which is why Huda Beauty is launching their Beauty Beyond Borders campaign, aimed to support those affected in war torn areas. Kattan herself is pushing for this initiative to be a success, stating that &ldquo;I wanna be the change that I see in the world&rdquo;.</p>
        <p>Once a month, Huda Beauty will gather materials to create care packages with basic necessities such as feminine products, canned foods, medical supplies and bottled water. Huda Beauty will be using thirty percent of proceeds from their new Strawberry Latte Collection to support the initiative.</p>
        <p style="text-align:center;letter-spacing:.2em;color:var(--text-2);">#########</p>
        <p><strong>About Huda Beaty:</strong> Founded in 2013 by award-winning makeup artist Huda Kattan, Huda Beauty is one of the world&rsquo;s fastest-growing beauty brands. Huda Beauty is dedicated to empowering individuals through self-expression and inclusivity. The brand&rsquo;s extensive portfolio includes cult-favorite items such as the Easy Bake Loose and Setting Powder, Easy Blur Foundation and the Easy Bake Setting Spray.</p>
        <p>Headquartered in Dubai, Huda Beauty continues to disrupt the industry by bringing luxury makeup to the every day makeup enthusiast. With a mission to inspire confidence, the brand maintains a massive global footprint, retailing through major retailers like Sephora and Walmart, as well as on its own direct to consumer platform, HudaBeauty.com.</p>
      `
    },
    financial: {
      tag: 'PRCC 1050 &middot; Critical Business Skills for PR Professionals',
      title: 'e.l.f. Beauty Financial Report Recap',
      className: '',
      body: `
        <p>E.L.F Beauty has been a beauty staple in the US for several years. According to the CEO in his letter to the shareholders, &ldquo;delivering on our mission to make the best of beauty accessible to every eye, lip and face.&rdquo; They are a household name, &ldquo;continue[ing] to deliver industry-leading results, putting e.l.f. Beauty in a rarified group &ndash; 1 of 6 public consumer companies out of 546 &ndash; to experience 25 consecutive quarters of both net sales and market share growth.&rdquo; E.L.F Beauty&rsquo;s brands include, e.l.f. Cosmetics, e.l.f. SKIN, Naturium, Well People and Keys Soulcare. Since its inception, the company has prided themselves on being an affordable and cruelty free brand, and that shows in the retails they partner with, including Target, Walmart, Ulta Beauty, Amazon, allowing them to ship both domestically and internationally.</p>
        <p>At first glance, if you look at their total assets between March of last year and March of this year, you will see a growth. Looking at things like their cash/cash equivalents, it has grown slightly since last year. However, looking at the bigger picture, it seems like there is a dip in multiple avenues. For example, when looking at the finances of the goodwill investments or the intangible assets, you can see a slight dip. There can be multiple reasons for this, possibly due to the acquisition, or the recent tariffs that were brought on by the current presidential administration. When taking a look at the big picture, E.L.F&rsquo;s financials are doing well in comparison to last year.</p>
        <p>E.L.F continues to expand their branding and reach across different platforms. For example, in the CEO&rsquo;s letter to the stakeholders, he mentions that they have initiatives like the &ldquo;Change the Board Game initiative to expand corporate boards to include more voices&rdquo;. They also partner with many Women in Sports partnerships and initiatives. And finally, he mentions supporting major female figures such as astronaut and activist Amanda Nguyen. Breaking into these different female dominated spaces creates strong brand awareness, and shows a sense of care for the community. In the 10-K report, they emphasize the importance of their &lsquo;one-team&rsquo; approach, and how their employee happiness is a top priority. They value company culture, and keeping employees happy, which in turn creates more productivity for E.L.F. They also maintain their stance on remaining an affordable brand by keeping their average price point of their products at $6.50.</p>
        <p>One business decision that was made was to not solely focus on one supplier for their raw materials. Since the tariffs on China that were set in place by the current administration, some companies have taken a hit with their profits due to the increased cost in materials. E.L.F mentions in the 10K Report that they have suppliers not only from China but also Thailand, Taiwan and Europe. They give E.L.F buyer power and allow them to keep their products relatively low compared to their competitors. Being a mass market brand is also beneficial in how they distribute their products. As mentioned before, they use domestic retailers such as Target and Amazon which allows them to reach a very broad audience. They also have their own e-commerce, which allows for both domestic and international reach.</p>
        <p>One major business risk that happens with any industry is the success of a new product launch. As mentioned in the 10K report, &ldquo;The beauty industry is driven in part by fashion and beauty trends, which may shift quickly. Our continued success depends on our ability to anticipate, gauge and react in a timely and cost-effective manner to changes in consumer preferences for beauty products, consumer attitudes toward our industry and brands and where and how consumers shop for those products.&rdquo; The opportunity here is to continue to embrace and utilize new technology to breed innovative products. Also, leaning into consumer feedback and trends can be a massive help to the various brands under E.L.F. Another major risk is acquiring a new brand, in this case rhode.</p>
        <p>Although E.L.F is a household name, no business rises to fame without challenges along the way. As mentioned in the &ldquo;Summary of Material Risks Associated With Our Business&rdquo; there are a few examples of some risks for E.L.F, including the competitive nature of the beauty industry in and of itself, the fact because a significant portion of their operations are in China they may suffer financially due to the tariffs and that their recent acquisition of rhode can hurt them financially if it doesn&rsquo;t perform well in stores. Acquiring a new brand can disrupt financials. There could be a myriad of risks, including unknown liabilities the company had prior to the acquisition, which could hurt E.L.F&rsquo;s reputation, the ability to integrate key executives and employees from rhode over to E.L.F, and potential financial strains that acquiring the brand could incur (i.e. having to bring on rhoda&rsquo;s legal and accounting teams).</p>
      `
    },
    pitch: {
      tag: 'PRCC 1060 &middot; Writing for PR Professionals &middot; Final Exam',
      title: 'Sample Pitch to a Journalist',
      className: 'doc-type-letter',
      body: `
        <p>Hi Frank!</p>
        <p>I enjoyed your piece on Scott Allison's retirement and what he has in store for the future. I believe that you would be the best person to meet with my client Ken Kerrigan, a seasoned PR professional who is being honored at his farewell reception, celebrating his retirement from NYU after 25&nbsp;years.</p>
        <p>Ken will be hosting a retirement party on May 1st at the historic Princeton Club, along with esteemed colleagues and NYU staff. Ken has a remarkable story, from his humble beginnings as a political science student working towards law school, to working for some of the best in the business, starting at Edelman to eventually ending his illustrious career with UHY. Ken has not only been a powerhouse in the field; he has passed on his knowledge to the future generation of professional communicators.</p>
        <p>I would like to share more information about the invite and send you a personal invitation. Please feel free to reach out via email at <strong>js10432@nyu.edu</strong> or reach out to my office at 555-555-1234.</p>
        <p>Best regards,<br>Jazlyn Sarpong</p>
      `
    }
  };

  /* ---------------- modal system ---------------- */
  const overlay = document.getElementById('modalOverlay');
  const modalEl = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalTag = document.getElementById('modalTag');
  const modalBody = document.getElementById('modalBody');
  const modalFoot = document.getElementById('modalFoot');
  const modalClose = document.getElementById('modalClose');
  let lastFocused = null;

  function openModal(key){
    const data = modalData[key];
    if (!data) return;
    lastFocused = document.activeElement;
    modalTitle.textContent = data.title;
    modalTag.innerHTML = data.tag;
    modalBody.innerHTML = data.body;
    modalEl.className = 'modal ' + (data.className || '');
    modalFoot.innerHTML = '<button class="btn btn-ghost btn-sm" id="modalDismiss">Close</button>';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('modalDismiss').addEventListener('click', closeModal);
    modalClose.focus();

    if (key === 'pressrelease') initDeckSlider();
  }

  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.getAttribute('data-modal')));
  });
  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* ---------------- MMR slide gallery + lightbox ---------------- */
  const SLIDE_COUNT = 11;
  const slideFull = (n) => `assets/works/mmr-slides/slide-${String(n).padStart(2,'0')}.jpg`;

  function initDeckSlider(){
    const slider = document.getElementById('mmrSlider');
    if (!slider || slider.dataset.rendered) return;
    slider.dataset.rendered = 'true';

    const img = document.getElementById('deckSlideImg');
    const counter = document.getElementById('deckCounter');
    const dotsWrap = document.getElementById('deckDots');
    const prevBtn = document.getElementById('deckPrev');
    const nextBtn = document.getElementById('deckNext');

    let dotsHtml = '';
    for (let n = 1; n <= SLIDE_COUNT; n++) {
      dotsHtml += `<button class="deck-dot" data-index="${n}" aria-label="Go to slide ${n}"></button>`;
    }
    dotsWrap.innerHTML = dotsHtml;
    const dots = Array.from(dotsWrap.querySelectorAll('.deck-dot'));

    let index = 1;
    function render(){
      img.src = slideFull(index);
      img.alt = `Huda Beauty media relations plan, slide ${index} of ${SLIDE_COUNT}`;
      counter.textContent = `${index} / ${SLIDE_COUNT}`;
      dots.forEach(d => d.classList.toggle('active', parseInt(d.dataset.index, 10) === index));
    }
    function step(dir){
      index = ((index - 1 + dir + SLIDE_COUNT) % SLIDE_COUNT) + 1;
      render();
    }
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    dots.forEach(d => d.addEventListener('click', () => {
      index = parseInt(d.dataset.index, 10);
      render();
    }));
    img.addEventListener('click', () => openLightbox(index));

    render();
  }

  const lightbox = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  let lightboxIndex = 1;
  let lightboxLastFocused = null;

  function openLightbox(index){
    lightboxLastFocused = document.activeElement;
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
  }
  function updateLightbox(){
    lightboxImg.src = slideFull(lightboxIndex);
    lightboxImg.alt = `Huda Beauty media relations plan, slide ${lightboxIndex}`;
    lightboxCaption.textContent = `Slide ${lightboxIndex} of ${SLIDE_COUNT}`;
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    if (lightboxLastFocused) lightboxLastFocused.focus();
  }
  function lightboxStep(dir){
    lightboxIndex = ((lightboxIndex - 1 + dir + SLIDE_COUNT) % SLIDE_COUNT) + 1;
    updateLightbox();
  }

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => lightboxStep(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => lightboxStep(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxStep(-1);
    if (e.key === 'ArrowRight') lightboxStep(1);
  });

})();
