// ==========================================================
// 1. Свёртывание / раскрытие основного блока
// ==========================================================
function toggleMainContent() {
	const mainContent = document.getElementById('mainContent');
	const toggleText = document.getElementById('toggleText');
	const toggleIcon = document.getElementById('toggleIcon');
	
	if (!mainContent) return;
	mainContent.classList.toggle('collapsed');
	
	if (mainContent.classList.contains('collapsed')) {
		if (toggleText) toggleText.textContent = 'Показать подробную информацию';
		if (toggleIcon) toggleIcon.textContent = '▼';
	} else {
		if (toggleText) toggleText.textContent = 'Свернуть основной блок';
		if (toggleIcon) toggleIcon.textContent = '▲';
	}
}

// ==========================================================
// 2. Анимация счетчиков + текущий год
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
	const metricsGrid = document.querySelector('.metrics-grid');
	const duration = 1200;
	const currentYear = new Date().getFullYear();

	const startCounters = () => {
		const counters = document.querySelectorAll('.counter');
		counters.forEach(counter => {
			const startYear = counter.getAttribute('data-start-year');
			const target = startYear ? (currentYear - parseInt(startYear)) : +counter.getAttribute('data-target');

			if (isNaN(target)) return;

			let startTimestamp = null;
			const step = (timestamp) => {
				if (!startTimestamp) startTimestamp = timestamp;
				const progress = Math.min((timestamp - startTimestamp) / duration, 1);
				const easeProgress = 1 - (1 - progress) * (1 - progress);
				
				counter.innerText = Math.floor(easeProgress * target);

				if (progress < 1) {
					window.requestAnimationFrame(step);
				} else {
					counter.innerText = target;
				}
			};
			window.requestAnimationFrame(step);
		});
	};

	if (metricsGrid && 'IntersectionObserver' in window) {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					startCounters();
				}
			});
		}, { threshold: 0.3 });

		observer.observe(metricsGrid);
	} else {
		startCounters();
	}

	const yearElem = document.getElementById('current-year');
	if (yearElem) yearElem.textContent = currentYear;
});

// ==========================================================
// 3. Логика работы слайдера
// ==========================================================
let currentSlide = 0;
const totalSlides = 5;

function updateSlider() {
	const track = document.getElementById('sliderTrack');
	if (track) {
		track.style.transform = `translateX(-${currentSlide * 20}%)`;
	}

	const buttons = document.querySelectorAll('.tab-btn');
	buttons.forEach((btn, index) => {
		btn.classList.toggle('active', index === currentSlide);
	});
}

function goToSlide(index) {
	currentSlide = index;
	updateSlider();
}

function moveSlide(direction) {
	currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
	updateSlider();
}

// ==========================================================
// 4. Логика выпадающих меню (Карта)
// ==========================================================
function toggleBlock(id) {
	const target = document.getElementById(id);
	if (!target) return;
	
	const isVisible = target.classList.contains('active');
	
	document.querySelectorAll('.expand-box').forEach(box => box.classList.remove('active'));
	
	if (!isVisible) {
		target.classList.add('active');
	}
}

// ==========================================================
// 5. Логика vCard (Сохранение контакта)
// ==========================================================
function executeVCardDownload() {
	const vcardData = [
		'BEGIN:VCARD',
		'VERSION:3.0',
		'FN:ООО СК ЭВЕРЕСТ',
		'ORG:ООО СК ЭВЕРЕСТ',
		'TEL;TYPE=WORK,VOICE:+73512143909',
		'EMAIL;TYPE=WORK:skeverest74@list.ru',
		'ADR;TYPE=WORK:;;ул. Могильникова, д. 95, оф. 102;Челябинск;;;Россия',
		'URL:https://vk.ru/stroim_mir_vmeste',
		'END:VCARD'
	].join('\r\n');

	const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
	const blobUrl = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = blobUrl;
	link.download = 'SK_Everest.vcf';
	
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

function downloadVCard() {
	const modal = document.getElementById('confirmModal');
	const modalTitle = document.getElementById('modalTitle');
	const modalText = document.getElementById('modalText');
	const modalActionBtn = document.getElementById('modalActionBtn');
	const modalCopyBtn = document.getElementById('modalCopyBtn');

	if (!modal) {
		executeVCardDownload();
		return;
	}

	if (modalTitle) modalTitle.textContent = 'Сохранение контакта';
	if (modalText) modalText.textContent = 'Уверены, что хотите сохранить контакт?';
	if (modalCopyBtn) modalCopyBtn.style.display = 'none';

	const newActionBtn = modalActionBtn.cloneNode(true);
	newActionBtn.textContent = 'Да, сохранить';
	modalActionBtn.parentNode.replaceChild(newActionBtn, modalActionBtn);

	newActionBtn.addEventListener('click', function () {
		executeVCardDownload();
		modal.classList.remove('active');
	});

	modal.classList.add('active');
}

// ==========================================================
// 6. Поддержка свайпов для слайдера
// ==========================================================
let startX = 0;
const viewport = document.getElementById('sliderViewport');

if (viewport) {
	viewport.addEventListener('touchstart', (e) => {
		startX = e.touches[0].clientX;
	}, { passive: true });

	viewport.addEventListener('touchend', (e) => {
		let endX = e.changedTouches[0].clientX;
		let diff = startX - endX;

		if (Math.abs(diff) > 40) {
			if (diff > 0) moveSlide(1);
			else moveSlide(-1);
		}
	}, { passive: true });
}

// ==========================================================
// 7. Обработчик ссылок (Портфолио, Телефон, Почта, Соцсети)
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
	const modal = document.getElementById('confirmModal');
	const modalTitle = document.getElementById('modalTitle');
	const modalText = document.getElementById('modalText');
	const modalCopyBtn = document.getElementById('modalCopyBtn');
	const modalCancelBtn = document.getElementById('modalCancelBtn');

	let targetUrl = '';
	let textToCopy = '';

	const closeModal = () => {
		if (modal) modal.classList.remove('active');
		if (modalCopyBtn) {
			modalCopyBtn.style.display = '';
			modalCopyBtn.textContent = 'Скопировать в буфер';
		}
	};

	document.addEventListener('click', (e) => {
		const link = e.target.closest('a');

		if (!link || link.classList.contains('badge-sro')) return;

		const hrefAttr = link.getAttribute('href') || '';

		let actionName = 'Перейти';
		let copyData = '';
		let messageText = 'Вы действительно хотите перейти по ссылке?';
		let isPdfDownload = false;

		// Проверяем, ведет ли ссылка на PDF-файл (portfolio.pdf или из папки portfolio)
		if (hrefAttr.toLowerCase().includes('.pdf') || hrefAttr.toLowerCase().includes('portfolio')) {
			messageText = 'Скачать портфолио компании?';
			actionName = 'Скачать PDF';
			copyData = '';
			isPdfDownload = true;
			if (modalCopyBtn) modalCopyBtn.style.display = 'none';
		} else if (hrefAttr.startsWith('tel:')) {
			messageText = 'Совершить звонок в компанию?';
			actionName = 'Позвонить';
			copyData = hrefAttr.replace('tel:', '');
			if (modalCopyBtn) modalCopyBtn.style.display = '';
		} else if (hrefAttr.startsWith('mailto:')) {
			messageText = 'Написать письмо на e-mail?';
			actionName = 'Написать';
			copyData = hrefAttr.replace('mailto:', '');
			if (modalCopyBtn) modalCopyBtn.style.display = '';
		} else if (link.classList.contains('social-circle-btn')) {
			messageText = 'Перейти в официальную социальную сеть?';
			actionName = 'Перейти';
			copyData = link.href;
			if (modalCopyBtn) modalCopyBtn.style.display = '';
		} else {
			return;
		}

		e.preventDefault();

		targetUrl = link.href;
		textToCopy = copyData;

		if (modalTitle) modalTitle.textContent = 'Подтверждение действия';

		if (modalText && modal) {
			modalText.textContent = messageText;

			const oldActionBtn = document.getElementById('modalActionBtn');
			const newActionBtn = oldActionBtn.cloneNode(true);
			newActionBtn.textContent = actionName;
			oldActionBtn.parentNode.replaceChild(newActionBtn, oldActionBtn);

			newActionBtn.addEventListener('click', () => {
				closeModal();
				
				if (isPdfDownload) {
					// Инициируем прямое скачивание через адресную строку
					window.location.href = targetUrl;
				} else {
					window.open(targetUrl, '_blank');
				}
			});

			modal.classList.add('active');
		}
	});

	if (modalCopyBtn) {
		modalCopyBtn.addEventListener('click', () => {
			if (!textToCopy) return;

			const onSuccess = () => {
				modalCopyBtn.textContent = 'Скопировано! ✓';
				setTimeout(() => {
					closeModal();
				}, 800);
			};

			if (navigator.clipboard && window.isSecureContext) {
				navigator.clipboard.writeText(textToCopy).then(onSuccess).catch(() => fallbackCopy(textToCopy, onSuccess));
			} else {
				fallbackCopy(textToCopy, onSuccess);
			}
		});
	}

	function fallbackCopy(text, callback) {
		const tempInput = document.createElement('textarea');
		tempInput.value = text;
		tempInput.style.position = 'fixed';
		tempInput.style.opacity = '0';
		document.body.appendChild(tempInput);
		tempInput.focus();
		tempInput.select();
		try {
			document.execCommand('copy');
			callback();
		} catch (err) {
			console.error('Ошибка копирования', err);
		}
		document.body.removeChild(tempInput);
	}

	if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);
	if (modal) {
		modal.addEventListener('click', (e) => {
			if (e.target === modal) closeModal();
		});
	}
});

// ==========================================================
// 8. Lightbox (Просмотр изображений)
// ==========================================================
function openLightbox(src, title, text) {
	const lightbox = document.getElementById('lightbox');
	const img = document.getElementById('lightbox-img');
	const titleEl = document.getElementById('lightbox-title');
	const textEl = document.getElementById('lightbox-text');

	if (!lightbox || !img) return;

	img.src = src;
	titleEl.textContent = title || '';
	textEl.textContent = text || '';

	// Показываем оверлей
	lightbox.style.display = 'flex';
	
	// Запрещаем прокрутку страницы под лайтбоксом
	document.body.style.overflow = 'hidden'; 

	// Принудительно вызываем масштабирование после отображения
	if (typeof rescaleCard === 'function') {
		rescaleCard();
	}
}

function closeLightbox(event) {
	// Закрываем только при клике на крестик или на темный фон вне картинки
	if (event && event.target !== event.currentTarget && !event.target.classList.contains('lightbox-close')) {
		return;
	}

	const lightbox = document.getElementById('lightbox');
	if (lightbox) {
		lightbox.style.display = 'none';
		document.body.style.overflow = ''; // Возвращаем скролл
	}
}