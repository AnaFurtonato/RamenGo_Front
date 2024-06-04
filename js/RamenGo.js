document.addEventListener('DOMContentLoaded', () => {
    const brothsContainer = document.getElementById('broths');
    const proteinsContainer = document.getElementById('proteins');
    const brothIndicators = document.getElementById('broth-indicators');
    const proteinIndicators = document.getElementById('protein-indicators');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const apiKey = 'ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf';

    const alertModal = document.getElementById('alert-modal');
    const closeModal = document.getElementById('close-modal');
    const alertMessage = document.getElementById('alert-message');

    const customModal = document.getElementById('custom-modal');
    const closeCustomModal = document.getElementById('close-custom-modal');
    const modalMessage = document.getElementById('modal-message');

    let selectedBrothId = null;
    let selectedProteinId = null;

    closeModal.addEventListener('click', () => {
        alertModal.style.display = 'none';
    });

    closeCustomModal.addEventListener('click', () => {
        customModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == alertModal) {
            alertModal.style.display = 'none';
        }
        if (event.target == customModal) {
            customModal.style.display = 'none';
        }
    };

    function showAlert(message) {
        alertMessage.textContent = message;
        alertModal.style.display = 'block';
    }

    function showCustomModal(message) {
        modalMessage.textContent = message;
        customModal.style.display = 'block';
    }

    async function fetchOptions(endpoint) {
        try {
            const response = await fetch(endpoint, {
                headers: { 'x-api-key': apiKey }
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Erro ao buscar dados de ${endpoint}:`, errorData);
                showAlert(`Erro ao buscar dados: ${errorData.message || 'Desconhecido'}`);
                return;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }

    async function loadOptions() {
        const broths = await fetchOptions('https://api.tech.redventures.com.br/broths');
        const proteins = await fetchOptions('https://api.tech.redventures.com.br/proteins');

        broths.forEach(broth => {
            const card = createCard(broth);
            brothsContainer.appendChild(card);
            card.addEventListener('click', () => selectCard(card, brothsContainer, 'broth'));
        });

        proteins.forEach(protein => {
            const card = createCard(protein);
            proteinsContainer.appendChild(card);
            card.addEventListener('click', () => selectCard(card, proteinsContainer, 'protein'));
        });

        createIndicators(brothsContainer, brothIndicators);
        createIndicators(proteinsContainer, proteinIndicators);

        enableCarouselDrag(brothsContainer);
        enableCarouselDrag(proteinsContainer);
    }

    function createCard(item) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = item.id;
    
        const inactiveImg = document.createElement('img');
        inactiveImg.src = item.imageInactive;
        inactiveImg.alt = item.name;
    
        const activeImg = document.createElement('img');
        activeImg.src = item.imageActive;
        activeImg.alt = item.name;
        activeImg.classList.add('iconeAtivo');
        activeImg.style.display = 'none';
    
        const title = document.createElement('h3');
        title.textContent = item.name;
    
        const description = document.createElement('p');
        description.textContent = item.description;
    
        const price = document.createElement('span');
        price.textContent = `US$ ${item.price}`;
        price.classList.add('price');
    
        card.append(inactiveImg, activeImg, title, description, price);
        return card;
    }

    function selectCard(card, container, type) {
        const cards = container.querySelectorAll('.card');
        cards.forEach(c => {
            c.classList.remove('selected');
            const inactiveImg = c.querySelector('img:nth-child(1)');
            const activeImg = c.querySelector('.iconeAtivo');
            inactiveImg.style.display = 'block';
            activeImg.style.display = 'none';
        });

        card.classList.add('selected');
        const inactiveImg = card.querySelector('img:nth-child(1)');
        const activeImg = card.querySelector('.iconeAtivo');
        inactiveImg.style.display = 'none';
        activeImg.style.display = 'block';

        if (type === 'broth') {
            selectedBrothId = card.dataset.id;
        } else if (type === 'protein') {
            selectedProteinId = card.dataset.id;
        }
    }

    function createIndicators(container, indicatorContainer) {
        const cards = container.querySelectorAll('.card');
        cards.forEach((_, index) => {
            const button = document.createElement('button');
            if (index === 0) button.classList.add('active');
            indicatorContainer.appendChild(button);

            button.addEventListener('click', () => {
                container.scrollLeft = container.offsetWidth * index;
            });
        });

        container.addEventListener('scroll', () => {
            const index = Math.round(container.scrollLeft / container.offsetWidth);
            indicatorContainer.querySelectorAll('button').forEach((button, i) => {
                if (i === index) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        });
    }

    function enableCarouselDrag(container) {
        let isDown = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.classList.add('active');
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.classList.remove('active');
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
            container.classList.remove('active');
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 3; 
            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('touchend', () => {
            isDown = false;
        });

        container.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 5;
            container.scrollLeft = scrollLeft - walk;
        });
    }

    placeOrderBtn.addEventListener('click', async () => {
        if (!selectedBrothId || !selectedProteinId) {
            showAlert('Select a broth and protein to place your order.');
            return;
        }
    
        try {
            const response = await fetch('https://api.tech.redventures.com.br/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    brothId: selectedBrothId,
                    proteinId: selectedProteinId
                })
            });
    
            const data = await response.json();
    
            const successUrl = `success.html?image=${encodeURIComponent(data.image)}&title=${encodeURIComponent(data.description)}`;
            window.location.href = successUrl;
        } catch (error) {
            console.error('Erro ao realizar o pedido:', error);
            showCustomModal('An error occurred while processing your order. Please try again later.');
        }
    });

    loadOptions();
});
