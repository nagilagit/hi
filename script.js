let qrCodeGenerated = null;
let currentQRValue = 0;
let currentPayload = "";

// Modo claro/escuro
function toggleMode() {
    const html = document.documentElement;
    html.classList.toggle('light');

    const img = document.querySelector('#profile img');
    if (!img) return;

    if (html.classList.contains('light')) {
        img.style.borderColor = '#FF1493';
        img.style.boxShadow = '0 0 20px rgba(255, 20, 147, 0.5)';
        img.src = './nagila.jpeg';
    } else {
        img.style.borderColor = '#FF69B4';
        img.style.boxShadow = '0 0 20px rgba(255, 105, 180, 0.5)';
        img.src = 'nagila2.jpg';
    }
}

// Contador de Likes
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

// Modal PIX
function showPixModal() {
    const modal = document.getElementById('pixModal');
    if (!modal) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hidePixModal() {
    const modal = document.getElementById('pixModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

window.onclick = function(event) {
    const modal = document.getElementById('pixModal');
    if (modal && event.target === modal) hidePixModal();
};

// Copiar chave PIX
const keyBox = document.querySelector('.key-box');
if (keyBox) {
    keyBox.addEventListener('click', function() {
        const chave = this.textContent.trim();
        navigator.clipboard.writeText(chave).then(() => {
            const status = document.getElementById('status');
            if (status) {
                status.textContent = 'Chave PIX copiada!';
                setTimeout(() => status.textContent = '', 3000);
            }
        });
    });
}

// Função auxiliar para gerar campos PIX
function campo(tag, valor) {
    const tamanho = valor.length.toString().padStart(2, '0');
    return tag + tamanho + valor;
}

// Gerador PIX compatível com PicPay
function gerarPix() {
    const inputValor = document.getElementById("valor");
    const statusEl = document.getElementById("status");
    if (!inputValor || !statusEl) return;

    const valor = parseFloat(inputValor.value);
    if (!valor || valor < 1) {
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
        campo("54", valor.toFixed(2).replace(",", ".")) +
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
        qrCodeGenerated = new QRCode(qrContainer, {
            text: currentPayload,
            width: 180,
            height: 180
        });
    }

    const copyBtn = document.getElementById("copyQRBtn");
    if (copyBtn) copyBtn.disabled = false;

    statusEl.textContent = `QR Code de R$${valor.toFixed(2)} gerado!`;
}

// Copiar código PIX puro
const copyQRBtn = document.getElementById("copyQRBtn");
if (copyQRBtn) {
    copyQRBtn.addEventListener("click", function() {
        if (!currentPayload) return;

        navigator.clipboard.writeText(currentPayload).then(() => {
            const status = document.getElementById("status");
            if (status) {
                status.textContent = "Código PIX copiado!";
                setTimeout(() => status.textContent = '', 3000);
            }

            const originalText = copyQRBtn.innerHTML;
            copyQRBtn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon>';
            setTimeout(() => {
                copyQRBtn.innerHTML = originalText;
            }, 2000);
        });
    });
}

// Cálculo CRC16
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

// Botões + e -
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

// Mostrar modal de vídeos
function showVideosModal() {
    const modal = document.getElementById('videosModal');
    if (!modal) return;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    document.querySelectorAll('.video-container:not(.loaded)').forEach(container => {
        const videoId = container.getAttribute('data-video-id');
        container.innerHTML = `
            <iframe src="https://www.tiktok.com/embed/v2/${videoId}"
                    frameborder="0"
                    allowfullscreen
                    loading="lazy"
                    style="width:100%;height:100%;">
            </iframe>`;
        container.classList.add('loaded');
    });
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) hideModal(e.target.id);
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => hideModal(m.id));
});

function adjustVideoHeight() {
    const containers = document.querySelectorAll('.video-container');
    const isMobile = window.innerWidth < 768;

    containers.forEach(container => {
        container.style.height = isMobile ? '70vh' : '60vh';
    });
}

window.addEventListener('load', adjustVideoHeight);
window.addEventListener('resize', adjustVideoHeight);