// Variáveis globais
let qrCodeGenerated = null;
let currentQRValue = 0;
let currentPayload = "";

// =========================
// Modo claro/escuro
// =========================
function toggleMode() {
    const html = document.documentElement;
    html.classList.toggle('light');

    const img = document.querySelector('#profile img');
    if (!img) return;

    if (html.classList.contains('light' || '')) {
        img.style.borderColor = '#FF1493';
        img.style.boxShadow = '0 0 20px rgba(255, 20, 147, 0.5)';
        img.src = './nagila.jpeg'; // caminho da imagem para o modo claro
    } else {
        img.style.borderColor = '#FF69B4';
        img.style.boxShadow = '0 0 20px rgba(255, 105, 180, 0.5)';
        img.src = './nagila2.jpg'; // caminho da imagem para o modo escuro
    }
}


// =========================
// Contador de Likes
// =========================
function setupLikeButton() {
    const likeButton = document.getElementById('likeButton');
    const likeCount = document.getElementById('likeCount');

    if (likeButton && likeCount) {
        likeButton.addEventListener('click', function() {
            this.classList.toggle('liked');

            let number = parseFloat(likeCount.textContent.replace('K', '')) *
                (likeCount.textContent.includes('K') ? 1000 : 1);

            number += this.classList.contains('liked') ? 1 : -1;

            likeCount.textContent = number >= 1000 ?
                (number / 1000).toFixed(1) + 'K' :
                number.toString();
        });
    }
}

// =========================
// Modal PIX
// =========================
function showPixModal() {
    const modal = document.getElementById('pixModal');
    if (!modal) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.getElementById('valor').focus();
}

function hidePixModal() {
    const modal = document.getElementById('pixModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function setupPixKeyCopy() {
    const keyBox = document.querySelector('.key-box');
    if (keyBox) {
        keyBox.addEventListener('click', function() {
            const chave = this.textContent.trim();
            copyToClipboard(chave).then(() => {
                const status = document.getElementById('status');
                if (status) {
                    status.textContent = 'Chave PIX copiada!';
                    setTimeout(() => status.textContent = '', 3000);
                }
            });
        });
    }
}

// =========================
// Gerador PIX
// =========================
function campo(tag, valor) {
    const tamanho = valor.length.toString().padStart(2, '0');
    return tag + tamanho + valor;
}

function gerarPix() {
    const inputValor = document.getElementById("valor");
    const statusEl = document.getElementById("status");
    if (!inputValor || !statusEl) return;

    const valor = parseFloat(inputValor.value.replace(',', '.'));
    if (isNaN(valor) || valor < 1) {
        statusEl.textContent = "Valor inválido! Mínimo R$1";
        return;
    }

    currentQRValue = valor;
    const chavePix = "622e3039-f634-4371-8086-66ed54f3f9a9";
    const nomeBeneficiario = "NAGILA LIMA DA CUNHA";
    const cidadeBeneficiario = "QUIXADA";
    const txid = "TX" + Date.now().toString().slice(-8);

    const merchantAccountInfo = campo("00", "br.gov.bcb.pix") + campo("01", chavePix);
    const additionalDataField = campo("05", txid);

    const payloadSemCRC =
        campo("00", "01") +
        campo("26", merchantAccountInfo) +
        campo("52", "0000") +
        campo("53", "986") +
        campo("54", valor.toFixed(2)) +
        campo("58", "BR") +
        campo("59", nomeBeneficiario) +
        campo("60", cidadeBeneficiario) +
        campo("62", additionalDataField) +
        "6304";

    const crc = calcularCRC16(payloadSemCRC);
    currentPayload = payloadSemCRC + crc;

    const qrContainer = document.getElementById("qrcode");
    if (qrContainer) {
        qrContainer.innerHTML = "";
        try {
            qrCodeGenerated = new QRCode(qrContainer, {
                text: currentPayload,
                width: 180,
                height: 180
            });
        } catch (error) {
            console.error("Erro ao gerar QR Code:", error);
            statusEl.textContent = "Erro ao gerar QR Code";
            return;
        }
    }

    const copyBtn = document.getElementById("copyQRBtn");
    if (copyBtn) copyBtn.disabled = false;

    statusEl.textContent = `QR Code de R$${valor.toFixed(2)} gerado!`;
}

function calcularCRC16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

// =========================
// Controle de valor PIX
// =========================
function changeValue(amount) {
    const input = document.getElementById("valor");
    if (!input) return;

    let value = parseInt(input.value) || 0;
    value += amount;
    if (value < 1) value = 1;
    input.value = value;

    const button = amount > 0 ? document.querySelector('.plus') : document.querySelector('.minus');
    if (button) {
        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
}

// =========================
// Modal de Vídeos
// =========================
function showVideosModal() {
    const modal = document.getElementById('videosModal');
    if (!modal) return;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Carrega vídeos
    loadVideos();

    // Configura carrossel apenas no mobile
    if (window.innerWidth <= 768) {
        setupMobileCarousel();
    }
}

function loadVideos() {
    document.querySelectorAll('.video-item').forEach(item => {
        const videoId = item.getAttribute('data-video-id');
        if (!item.classList.contains('loaded')) {
            item.innerHTML = `
                <iframe src="https://www.tiktok.com/embed/v2/${videoId}?autoplay=0"
                    frameborder="0" 
                    allowfullscreen 
                    loading="lazy"
                    style="width:100%;height:100%;"></iframe>
                <div class="video-overlay">
                    <ion-icon name="play-circle-outline"></ion-icon>
                </div>`;
            item.classList.add('loaded');
        }
    });
}

function setupMobileCarousel() {
    const dotsContainer = document.querySelector('.carousel-dots');
    const videos = document.querySelectorAll('.video-item');

    // Cria dots
    dotsContainer.innerHTML = '';
    videos.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => {
            videos[i].scrollIntoView({ behavior: 'smooth' });
        });
        dotsContainer.appendChild(dot);
    });

    // Atualiza dots durante o scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = [...videos].indexOf(entry.target);
                document.querySelectorAll('.dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            }
        });
    }, { threshold: 0.7 });

    videos.forEach(video => observer.observe(video));
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Pausa todos os vídeos ao fechar o modal
    document.querySelectorAll('.video-container iframe').forEach(iframe => {
        iframe.src = iframe.src.replace('autoplay=1', 'autoplay=0');
    });

    // Mostra todos os overlays novamente
    document.querySelectorAll('.video-play-overlay').forEach(overlay => {
        overlay.style.display = 'flex';
    });

    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// =========================
// Utilitários
// =========================
function copyToClipboard(text) {
    if (!navigator.clipboard) {
        // Fallback para navegadores antigos
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve();
    }
    return navigator.clipboard.writeText(text);
}

function setupCopyQRButton() {
    const copyQRBtn = document.getElementById("copyQRBtn");
    if (copyQRBtn) {
        copyQRBtn.addEventListener("click", function() {
            if (!currentPayload) return;

            copyToClipboard(currentPayload).then(() => {
                const status = document.getElementById("status");
                if (status) {
                    status.textContent = "Código PIX copiado!";
                    setTimeout(() => status.textContent = '', 3000);
                }

                const originalText = copyQRBtn.innerHTML;
                copyQRBtn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon> Copiado!';
                setTimeout(() => {
                    copyQRBtn.innerHTML = originalText;
                }, 2000);
            });
        });
    }
}

// =========================
// Ajuste de layout responsivo
// =========================
function adjustVideoHeight() {
    const containers = document.querySelectorAll('.video-container');
    const isMobile = window.innerWidth < 768;

    containers.forEach(container => {
        container.style.height = isMobile ? '70vh' : '60vh';
    });
}

// =========================
// Inicialização
// =========================
document.addEventListener('DOMContentLoaded', function() {
    setupLikeButton();
    setupPixKeyCopy();
    setupCopyQRButton();
    adjustVideoHeight();

    // Fechar modais ao clicar fora
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target.id);
        }
    });

    // Fechar modais com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => hideModal(m.id));
        }
    });
});

window.addEventListener('resize', adjustVideoHeight);
document.addEventListener('click', (e) => {
    const videoOverlay = e.target.closest('.video-overlay');
    if (videoOverlay) {
        const iframe = videoOverlay.previousElementSibling;
        if (iframe) {
            if (iframe.src.includes('autoplay=0')) {
                iframe.src = iframe.src.replace('autoplay=0', 'autoplay=1');
                videoOverlay.style.display = 'none';
            }
        }
    }
});
console.log('Altura do vídeo:', document.querySelector('.video-item').offsetHeight);