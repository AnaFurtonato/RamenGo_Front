document.addEventListener('DOMContentLoaded', () => {
    const brothsContainer = document.getElementById('broths');
    const proteinsContainer = document.getElementById('proteins');
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
    }

    function createCard(item) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = item.id;

        const inactiveImg = document.createElement('img');
        inactiveImg.src = `image/icon/${item.name.toLowerCase()}/inactive.png`;
        inactiveImg.alt = item.name;

        const activeImg = document.createElement('img');
        activeImg.src = `image/icon/${item.name.toLowerCase()}/active.png`;
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

    placeOrderBtn.addEventListener('click', async () => {
        if (!selectedBrothId || !selectedProteinId) {
            showAlert('Selecione um caldo e uma proteína para fazer o pedido.');
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
    
            let orderImageSrc = '';
            let orderTitleText = '';
    
            if (selectedBrothId === '2' && selectedProteinId === '3') {
                orderImageSrc = 'image/shoyu.png';
                orderTitleText = 'Shoyu and Karaage Ramen';
            } else if (selectedBrothId === '3' && selectedProteinId === '1') {
                orderImageSrc = 'image/miso.png';
                orderTitleText = 'Miso and Chasu Ramen';
            } else if (selectedBrothId === '1' && selectedProteinId === '2') {
                orderImageSrc = 'image/salt.png';
                orderTitleText = 'Salt and Yasai Vegetable Ramen';
            } else {
                showCustomModal('Sorry, we couldn\'t process your order with the selected options.');
                return;
            }
    
            
            const queryString = `?image=${encodeURIComponent(orderImageSrc)}&title=${encodeURIComponent(orderTitleText)}`;
            window.location.href = `success.html${queryString}`;
    
        } catch (error) {
            console.error('Erro ao realizar o pedido:', error);
        }
    });

    loadOptions();
});
