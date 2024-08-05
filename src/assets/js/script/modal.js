function initPartner() {
    document.querySelectorAll('.js--partner-modal-toggle').forEach((item) => {
        item.addEventListener('click', () => {
            item.parentElement.classList.toggle('active');
        });
    });
}

initPartner();
