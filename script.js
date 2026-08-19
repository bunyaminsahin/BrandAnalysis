const API_BASE_URL = "https://brandanalysis-l2hj.onrender.com/api/feedbacks";

const textareaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEl = document.querySelector(".submit-btn");
const hashtagEls = document.querySelectorAll(".hashtag");

const MAX_CHARS = 150;
const MIN_TEXT_CHARS = 2;
const FEEDBACK_STATE_DURATION = 1000;
const TOAST_DURATION = 3000;

let selectedHashtag = "";
let companyWarningShown = false;

textareaEl.readOnly = true;
textareaEl.value = "";

// ----------------------------------------------------
// API İŞLEMLERİ (FETCH / POST / PATCH)
// ----------------------------------------------------

// 1. Veritabanından Yorumları Çek ve Ekrana Bas (GET)
const fetchFeedbacks = async (companyName = "") => {
    try {
        let url = API_BASE_URL;
        if (companyName) {
            url += `?company=${encodeURIComponent(companyName)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Yorumlar alınamadı");

        const feedbacks = await response.json();
        
        // Listeyi temizle ve veritabanından gelenleri render et
        feedbackListEl.innerHTML = "";
        feedbacks.forEach((item) => {
            const feedbackHTML = createFeedbackHTML(
                item.id,
                item.company,
                item.badge_letter,
                item.text,
                item.upvotes
            );
            feedbackListEl.insertAdjacentHTML("beforeend", feedbackHTML);
        });
    } catch (error) {
        console.error("API Error:", error);
        showToast("⚠️ Veriler yüklenirken bir hata oluştu.");
    }
};

// Sayfa yüklendiğinde tüm yorumları çek
fetchFeedbacks();

// 2. Upvote Tıklama Olayı (PATCH)
feedbackListEl.addEventListener("click", async (event) => {
    const upvoteBtn = event.target.closest(".upvote");
    if (!upvoteBtn) return;

    const feedbackItem = upvoteBtn.closest(".feedback");
    const id = feedbackItem.dataset.id;

    if (!id) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${id}/upvote`, {
            method: "PATCH"
        });

        if (!response.ok) throw new Error("Upvote güncellenemedi");

        const updatedFeedback = await response.json();
        
        // Ekrana basılan sayacı güncelle ve butonu pasif yap
        const countEl = upvoteBtn.querySelector(".upvote__count");
        countEl.textContent = updatedFeedback.upvotes;
        upvoteBtn.disabled = true;
    } catch (error) {
        console.error("Upvote error:", error);
    }
});

// ----------------------------------------------------
// YARDIMCI VE YÖNETİM FONKSİYONLARI
// ----------------------------------------------------

const showToast = (message) => {
    const toastEl = document.createElement("div");
    toastEl.classList.add("toast");
    toastEl.innerHTML = message;

    document.body.append(toastEl);

    setTimeout(() => {
        toastEl.remove();
    }, TOAST_DURATION);
};

const setFormState = (state, message = "") => {
    formEl.classList.remove("form--valid", "form--invalid");

    if (!state) return;

    formEl.classList.add(`form--${state}`);

    if (message) {
        showToast(message);
    }

    setTimeout(() => {
        formEl.classList.remove(`form--${state}`);
    }, FEEDBACK_STATE_DURATION);
};

const showInvalid = (message) => {
    setFormState("invalid", message);
    textareaEl.focus();
};

const showCompanyWarning = () => {
    if (companyWarningShown) return;

    companyWarningShown = true;
    showToast("⚠️ Please select a company first.");

    setTimeout(() => {
        companyWarningShown = false;
    }, FEEDBACK_STATE_DURATION);
};

const updateCounter = () => {
    const charsLeft = MAX_CHARS - textareaEl.value.length;
    counterEl.textContent = charsLeft;
};

const getProtectedLength = () => {
    return selectedHashtag ? `${selectedHashtag} `.length : 0;
};

const moveCursorAfterHashtag = () => {
    const protectedLength = getProtectedLength();
    textareaEl.setSelectionRange(protectedLength, protectedLength);
};

const isCompanySelected = () => {
    return Boolean(selectedHashtag);
};

const isValidCompany = () => {
    const selectedCompany = selectedHashtag.toLowerCase();
    return Array.from(hashtagEls).some(
        (hashtagEl) =>
            hashtagEl.textContent.trim().toLowerCase() === selectedCompany
    );
};

const hasSelectedCompanyPrefix = (text) => {
    return text.toLowerCase().startsWith(selectedHashtag.toLowerCase());
};

const getFeedbackText = (text) => {
    return text.substring(selectedHashtag.length).trim();
};

const hasMinimumText = (text) => {
    const letters = text.match(/[A-Za-zÇĞİÖŞÜçğıöşü]/g) || [];
    return letters.length >= MIN_TEXT_CHARS;
};

const resetForm = () => {
    textareaEl.value = "";
    textareaEl.readOnly = true;

    selectedHashtag = "";
    companyWarningShown = false;

    counterEl.textContent = MAX_CHARS;
    submitBtnEl.blur();
};

const createFeedbackHTML = (id, company, badgeLetter, text, upvotes = 0) => {
    return `
        <li class="feedback" data-id="${id}">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${upvotes}</span>
            </button>

            <section class="feedback__badge">
                <p class="feedback__letter">
                    ${badgeLetter}
                </p>
            </section>

            <div class="feedback__content">
                <p class="feedback__company">
                    ${company}
                </p>

                <p class="feedback__text">
                    ${text}
                </p>
            </div>

            <p class="feedback__date">NEW</p>
        </li>
    `;
};

// ----------------------------------------------------
// EVENT LISTENERS (OLAY DİNLEYİCİLERİ)
// ----------------------------------------------------

const hashtagHandler = (event) => {
    const clickedText = event.currentTarget.textContent.trim();

    // #All Feedbacks butonuna basıldığında
    if (clickedText === "#All Feedbacks") {
        resetForm();
        fetchFeedbacks(); // Tüm yorumları getir
        return;
    }

    selectedHashtag = clickedText;
    companyWarningShown = false;

    textareaEl.readOnly = false;
    textareaEl.value = `${selectedHashtag} `;

    textareaEl.focus();
    moveCursorAfterHashtag();
    updateCounter();

    // Seçilen şirkete göre listeyi filtrele
    const company = selectedHashtag.substring(1).trim();
    fetchFeedbacks(company);
};

hashtagEls.forEach((hashtagEl) => {
    hashtagEl.addEventListener("click", hashtagHandler);
});

textareaEl.addEventListener("focus", () => {
    if (!isCompanySelected()) {
        showCompanyWarning();
        textareaEl.blur();
    }
});

textareaEl.addEventListener("click", () => {
    if (!isCompanySelected()) {
        showCompanyWarning();
        textareaEl.blur();
        return;
    }

    if (textareaEl.selectionStart < getProtectedLength()) {
        moveCursorAfterHashtag();
    }
});

textareaEl.addEventListener("keydown", (event) => {
    if (!isCompanySelected()) {
        event.preventDefault();
        showCompanyWarning();
        textareaEl.blur();
        return;
    }

    const protectedLength = getProtectedLength();
    const selectionStart = textareaEl.selectionStart;
    const selectionEnd = textareaEl.selectionEnd;

    const isDeleting = event.key === "Backspace" || event.key === "Delete";
    const touchesProtectedArea =
        selectionStart < protectedLength || selectionEnd < protectedLength;

    if (isDeleting && touchesProtectedArea) {
        event.preventDefault();
        moveCursorAfterHashtag();
    }
});

textareaEl.addEventListener("paste", (event) => {
    if (!isCompanySelected()) {
        event.preventDefault();
        showCompanyWarning();
        return;
    }

    const touchesProtectedArea =
        textareaEl.selectionStart < getProtectedLength() ||
        textareaEl.selectionEnd < getProtectedLength();

    if (touchesProtectedArea) {
        event.preventDefault();
        moveCursorAfterHashtag();
    }
});

textareaEl.addEventListener("drop", (event) => {
    if (!isCompanySelected()) {
        event.preventDefault();
        showCompanyWarning();
        return;
    }

    if (textareaEl.selectionStart < getProtectedLength()) {
        event.preventDefault();
        moveCursorAfterHashtag();
    }
});

textareaEl.addEventListener("input", () => {
    if (!isCompanySelected()) {
        updateCounter();
        return;
    }

    const protectedPrefix = `${selectedHashtag} `;
    const hasProtectedPrefix = textareaEl.value
        .toLowerCase()
        .startsWith(protectedPrefix.toLowerCase());

    if (!hasProtectedPrefix) {
        textareaEl.value = protectedPrefix;
        textareaEl.focus();
        moveCursorAfterHashtag();
    }

    updateCounter();
});

// 3. Form Gönderme Olayı (POST)
const submitHandler = async (event) => {
    event.preventDefault();

    if (!isCompanySelected()) {
        showInvalid("⚠️ Please select a company first.");
        return;
    }

    if (!isValidCompany()) {
        showInvalid("⚠️ Please select a valid company from the list.");
        return;
    }

    const text = textareaEl.value.trim();

    if (!hasSelectedCompanyPrefix(text)) {
        showInvalid("⚠️ Please select a company first.");
        return;
    }

    const feedbackText = getFeedbackText(text);

    if (!hasMinimumText(feedbackText)) {
        showInvalid(`⚠️ Please enter at least ${MIN_TEXT_CHARS} characters.`);
        return;
    }

    const company = selectedHashtag.substring(1).trim();
    const badgeLetter = company.substring(0, 1).toUpperCase();

    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                company,
                badgeLetter,
                text
            })
        });

        if (!response.ok) throw new Error("Kaydedilirken bir hata oluştu");

        const newFeedback = await response.json();

        const feedbackHTML = createFeedbackHTML(
            newFeedback.id,
            newFeedback.company,
            newFeedback.badge_letter,
            newFeedback.text,
            newFeedback.upvotes
        );

        feedbackListEl.insertAdjacentHTML("afterbegin", feedbackHTML);

        setFormState("valid");
        resetForm();
    } catch (error) {
        console.error("Submit error:", error);
        showInvalid("⚠️ Sunucuya kaydedilemedi.");
    }
};

formEl.addEventListener("submit", submitHandler);