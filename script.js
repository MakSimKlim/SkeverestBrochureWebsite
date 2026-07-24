// Функция свёртывания / раскрытия основного блока
function toggleMainContent() {
	const mainContent = document.getElementById('mainContent');
	const toggleText = document.getElementById('toggleText');
	const toggleIcon = document.getElementById('toggleIcon');
	
	mainContent.classList.toggle('collapsed');
	
	if (mainContent.classList.contains('collapsed')) {
		toggleText.textContent = 'Показать подробную информацию';
		toggleIcon.textContent = '▼';
	} else {
		toggleText.textContent = 'Свернуть основной блок';
		toggleIcon.textContent = '▲';
	}
}

  // Универсальная анимация всех счетчиков (включая авторасчет лет)
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

	// Наблюдатель: перезапускает анимацию каждый раз при появлении блока на экране
	if (metricsGrid && 'IntersectionObserver' in window) {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					startCounters(); // Запускаем счет при входе в видимую область
				}
			});
		}, { threshold: 0.3 }); // Сработает, когда показано 30% блока

		observer.observe(metricsGrid);
	} else {
		startCounters(); // Резервный вариант, если браузер старый
	}

	// Подстановка года в футер
	const yearElem = document.getElementById('current-year');
	if (yearElem) yearElem.textContent = currentYear;
});

  // Логика работы слайдера
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

  // Логика выпадающих меню (Карта)
  function toggleBlock(id) {
      const target = document.getElementById(id);
      if (!target) return;
      
      const isVisible = target.classList.contains('active');
      
      document.querySelectorAll('.expand-box').forEach(box => box.classList.remove('active'));
      
      if (!isVisible) {
          target.classList.add('active');
      }
  }


// 1. Функция генерации и скачивания (получила правильное имя)
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

	// Создаем бинарный объект (Blob) с явным указанием кодировки UTF-8
	const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
	
	// Создаем временную виртуальную ссылку
	const blobUrl = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = blobUrl;
	link.download = 'SK_Everest.vcf'; // Теперь браузер сохранит именно это имя!
	
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Освобождаем память через небольшую задержку
	setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

// 2. Функция вызова модального окна
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

	// Настраиваем тексты
	if (modalTitle) modalTitle.textContent = 'Сохранение контакта';
	if (modalText) modalText.textContent = 'Уверены, что хотите сохранить?';
	if (modalActionBtn) modalActionBtn.textContent = 'Да, сохранить';
	
	// Прячем кнопку копирования
	if (modalCopyBtn) modalCopyBtn.style.display = 'none';

	// ВАЖНО: Переназначаем событие клика с помощью cloneNode, 
	// чтобы полностью удалить предыдущие привязки (включая ссылки на PDF)
	const newActionBtn = modalActionBtn.cloneNode(true);
	modalActionBtn.parentNode.replaceChild(newActionBtn, modalActionBtn);

	// Вешаем ЧИСТОЕ действие скачивания vCard
	newActionBtn.addEventListener('click', function () {
		executeVCardDownload();
		modal.classList.remove('active');
	});

	// Показываем окно
	modal.classList.add('active');
}

  // Поддержка свайпов
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
              if (diff > 0) moveSlide(1);  // свайп влево
              else moveSlide(-1);         // свайп вправо
          }
      }, { passive: true });
  }

// ==========================================================
// ОБНОВЛЕННАЯ ЛОГИКА: Модальное окно + Скопировать в буфер
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
	const modal = document.getElementById('confirmModal');
	const modalText = document.getElementById('modalText');
	const modalActionBtn = document.getElementById('modalActionBtn');
	const modalCopyBtn = document.getElementById('modalCopyBtn');
	const modalCancelBtn = document.getElementById('modalCancelBtn');

	let targetUrl = '';
	let textToCopy = '';

	// Функция закрытия окна и сброса состояния
	const closeModal = () => {
		if (modal) modal.classList.remove('active');
		if (modalCopyBtn) {
			modalCopyBtn.style.display = '';
			modalCopyBtn.textContent = 'Скопировать в буфер';
		}
	};

	document.addEventListener('click', (e) => {
		const link = e.target.closest('a');

		// Игнорируем клики вне ссылок и ссылки с классом badge-sro
		if (!link || link.classList.contains('badge-sro')) return;

		// Читаем ТОЧНЫЙ атрибут href из HTML (а не браузерную интерпретацию)
		const hrefAttr = link.getAttribute('href') || '';

		let actionName = 'Перейти';
		let copyData = '';
		let messageText = 'Вы действительно хотите перейти по ссылке?';

		if (hrefAttr.includes('portfolio.pdf')) {
			messageText = 'Скачать портфолио компании?';
			actionName = 'Скачать PDF';
			copyData = '';
			if (modalCopyBtn) modalCopyBtn.style.display = 'none'; // Прячем кнопку скопировать
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
			return; // Для остальных обычных ссылок модалку не открываем
		}

		e.preventDefault();

		targetUrl = link.href;
		textToCopy = copyData;

		if (modalText && modalActionBtn && modal) {
			modalText.textContent = messageText;
			modalActionBtn.textContent = actionName;
			modal.classList.add('active');
		}
	});

	// Кнопка перенаправления/звонка
	if (modalActionBtn) {
		modalActionBtn.addEventListener('click', () => {
			closeModal();
			window.open(targetUrl, '_blank');
		});
	}

	// Кнопка копирования с поддержкой fallback для всех условий
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

	// Резервная функция копирования (для HTTP и старых устройств)
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

// Открытие Lightbox
function openLightbox(imgSrc, title, description) {
	document.getElementById('lightbox-img').src = imgSrc;
	document.getElementById('lightbox-title').innerText = title;
	document.getElementById('lightbox-text').innerText = description;
	document.getElementById('lightbox').style.display = 'flex';
}

// Закрытие Lightbox
function closeLightbox(event) {
	if (event.target.id === 'lightbox' || event.target.classList.contains('lightbox-close')) {
		document.getElementById('lightbox').style.display = 'none';
	}
}
