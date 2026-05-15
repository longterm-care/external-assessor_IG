document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('applicationForm');
    const steps = document.querySelectorAll('.form-step');
    const stepItems = document.querySelectorAll('.step-item');
    const nextBtns = document.querySelectorAll('.next-step');
    const prevBtns = document.querySelectorAll('.prev-step');
    
    const signatureCanvas = document.getElementById('signature-pad');
    const clearBtn = document.getElementById('clearSignature');
    const birthInput = document.querySelector('input[name="birthdate"]');
    const ageInput = document.querySelector('input[name="age"]');
    const infoSummary = document.getElementById('infoSummary');
    
    let currentStep = 1;

    // Landing Page Logic
    const landingPage = document.getElementById('landingPage');
    const startBtn = document.getElementById('startApp');
    const mainHeader = document.getElementById('mainHeader');
    const mainStepper = document.getElementById('mainStepper');
    const appForm = document.getElementById('applicationForm');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            landingPage.style.display = 'none';
            mainHeader.style.display = 'block';
            mainStepper.style.display = 'flex';
            appForm.style.display = 'block';
            currentStep = 1;
            updateSteps();
        });
    }

    // Set current date for Step 8
    const displayDate = document.getElementById('displayDate');
    if (displayDate) {
        const d = new Date();
        displayDate.value = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    }

    // Initialize Signature Pad
    const signaturePad = new SignaturePad(signatureCanvas, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: '#000000'
    });

    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        signatureCanvas.width = signatureCanvas.offsetWidth * ratio;
        signatureCanvas.height = signatureCanvas.offsetHeight * ratio;
        signatureCanvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }
    window.addEventListener("resize", resizeCanvas);

    clearBtn.addEventListener('click', () => signaturePad.clear());

    // Update info summary on Step 8
    function updateInfoSummary() {
        if (!infoSummary) return;
        const qualMap = { academic: "학계", field: "현장 경력자", public: "공무원 등" };
        const qual = document.querySelector('input[name="qualification"]:checked')?.value || "-";
        const name = document.querySelector('input[name="name"]')?.value || "-";
        const gender = document.querySelector('input[name="gender"]:checked')?.value || "-";
        const birth = document.querySelector('input[name="birthdate"]')?.value || "-";
        const phone = document.querySelector('input[name="phone"]')?.value || "-";
        const email = document.querySelector('input[name="email"]')?.value || "-";

        infoSummary.innerHTML = `
            <strong>지원자격</strong> <span>${qualMap[qual] || qual}</span>
            <strong>성명</strong> <span>${name}</span>
            <strong>성별</strong> <span>${gender}</span>
            <strong>생년월일</strong> <span>${birth}</span>
            <strong>전화번호</strong> <span>${phone}</span>
            <strong>이메일</strong> <span>${email}</span>
        `;
    }

    // Step Navigation
    function updateSteps() {
        steps.forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === currentStep);
        });
        stepItems.forEach(item => {
            const stepNum = parseInt(item.dataset.step);
            item.classList.toggle('active', stepNum === currentStep);
            item.classList.toggle('completed', stepNum < currentStep);
        });

        // Step 3 Dynamic Validation Logic
        if (currentStep === 3) {
            const qualification = document.querySelector('input[name="qualification"]:checked')?.value;
            const majorLabel = document.getElementById('majorLabel');
            const majorInput = document.getElementById('majorInput');
            
            if (qualification === 'academic') {
                majorLabel.classList.add('required');
                majorInput.required = true;
            } else {
                majorLabel.classList.remove('required');
                majorInput.required = false;
            }
        }

        // Summary and Signature Pad logic for Step 8
        if (currentStep === 8) {
            updateInfoSummary();
            setTimeout(resizeCanvas, 100);
        }

        // Final Step UI (Post-submission)
        if (currentStep === 9) {
            mainStepper.style.display = 'none'; // Hide stepper on completion page
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function validateStep(stepNum) {
        const currentStepEl = document.querySelector(`.form-step[data-step="${stepNum}"]`);
        if (!currentStepEl) return true;
        const inputs = currentStepEl.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (input.type === 'radio') {
                const name = input.getAttribute('name');
                const checked = currentStepEl.querySelector(`input[name="${name}"]:checked`);
                if (!checked) isValid = false;
            } else if (input.type === 'checkbox') {
                if (!input.checked) isValid = false;
            } else if (!input.value) {
                input.style.borderColor = 'var(--error)';
                isValid = false;
            } else {
                input.style.borderColor = 'var(--border)';
            }
        });

        if (stepNum === 1) {
            const selected = currentStepEl.querySelector('input[name="qualification"]:checked');
            if (!selected) {
                alert('자격 기준을 선택해 주세요.');
                isValid = false;
            }
        }

        if (stepNum === 6) {
            const intro = currentStepEl.querySelector('textarea[name="self_intro"]');
            if (intro && intro.value.trim().length < 10) {
                alert('지원동기 및 포부를 10자 이상 입력해 주세요.');
                isValid = false;
            }
        }

        return isValid;
    }

    // Stepper Clickable Navigation
    stepItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const targetStep = parseInt(item.dataset.step);
            if (currentStep === 9 || targetStep === 9) return; // Disable clicking after submission or skipping to step 9 directly
            
            if (targetStep < currentStep) {
                currentStep = targetStep;
                updateSteps();
            } else if (targetStep > currentStep) {
                if (validateStep(currentStep)) {
                    if (targetStep === currentStep + 1) {
                        currentStep = targetStep;
                        updateSteps();
                    }
                }
            }
        });
    });

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                updateSteps();
            } else {
                alert('필수 항목을 모두 입력해 주세요.');
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateSteps();
        });
    });

    // Phone Number Auto-formatting
    const formatPhone = (input) => {
        input.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^0-9]/g, '');
            if (val.length > 3 && val.length <= 7) {
                val = val.slice(0, 3) + '-' + val.slice(3);
            } else if (val.length > 7) {
                val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
            }
            e.target.value = val;
        });
    };

    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) formatPhone(phoneInput);

    // Age Calculation
    birthInput.addEventListener('change', () => {
        const birthDate = new Date(birthInput.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        ageInput.value = age >= 0 ? age : '';
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const disqCheck = document.querySelector('input[name="disqualification_check"]');
        if (disqCheck && !disqCheck.checked) {
            alert('결격대상 확인 항목에 동의해 주세요.');
            return;
        }

        if (signaturePad.isEmpty()) {
            alert('전자서명을 완료해 주세요.');
            return;
        }

        // Final validation check to be extra sure
        if (!validateStep(currentStep)) {
            alert('필수 항목을 모두 입력해 주세요.');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.submittedAt = new Date().toLocaleString();
        data.signature = signaturePad.toDataURL();

        // 1. 화면에 있는 문항들의 답변을 순서대로 배열로 만들기
        const answers = Array.from(formData.values());
        
        // 서명 데이터(Base64)를 배열 마지막에 추가
        const signatureData = signaturePad.toDataURL();
        answers.push(signatureData);

        // 2. 구글 웹 앱으로 전송할 JSON 데이터 구성
        const payload = {
            action: "submitApplication",
            answers: answers
        };

        // fetch를 이용한 POST 전송 (CORS 이슈 방지를 위해 text/plain 방식 사용)
        fetch("https://script.google.com/macros/s/AKfycbw5dZOqXyKkZBv6FDXCmWMxGku3IZLmzki-PVT1ySIpxaz13MI2_wNm0K2F0U8JiFOP/exec", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            console.log('구글 웹 앱으로 전송 완료:', response);
        })
        .catch(error => {
            console.error('구글 웹 앱 전송 중 오류 발생:', error);
        });

        // Save to LocalStorage (기존 로직 유지)
        const existing = JSON.parse(localStorage.getItem('recruitment_submissions') || '[]');
        existing.push(data);
        localStorage.setItem('recruitment_submissions', JSON.stringify(existing));

        // Move to the final instruction step (Step 9)
        currentStep = 9;
        updateSteps();
        
        // Final thank you icon rendering
        lucide.createIcons();
    });
});
