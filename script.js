const courses = document.querySelectorAll('.course-item');
let approvedCourses = new Set();

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('approvedCoursesUNLaR'); // Usar un nombre de clave más específico
    if (savedState) {
        approvedCourses = new Set(JSON.parse(savedState));
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('approvedCoursesUNLaR', JSON.stringify(Array.from(approvedCourses)));
}

// Check if a course's prerequisites are met
function arePrereqsMet(prereqsString) {
    if (!prereqsString) {
        return true; // No prerequisites
    }
    const prereqs = prereqsString.split(',').map(p => p.trim());
    for (const prereq of prereqs) {
        // For elective courses, check if *any* of the elective options (if listed) or the main elective itself is approved
        // This is a simplification; in a real system, you'd pick one elective.
        // Here, if the main elective "title" is approved, it counts.
        if (prereq.includes('ASIGNATURA ELECTIVA')) {
            // If the main elective IS the prerequisite, check if that specific elective is approved.
            if (!approvedCourses.has(prereq)) {
                 return false;
            }
        } else if (!approvedCourses.has(prereq)) {
            return false;
        }
    }
    return true;
}

// Update course states (locked/unlocked/approved)
function updateCourseStates() {
    courses.forEach(course => {
        const courseId = course.id;
        const prereqs = course.dataset.prereqs;

        if (approvedCourses.has(courseId)) {
            course.classList.add('approved');
            course.classList.remove('locked', 'unlocked');
        } else if (arePrereqsMet(prereqs)) {
            course.classList.add('unlocked');
            course.classList.remove('locked', 'approved');
            course.style.cursor = 'pointer';
        } else {
            course.classList.add('locked');
            course.classList.remove('unlocked', 'approved');
            course.style.cursor = 'not-allowed';
        }
    });
}

// Handle course click
function handleCourseClick(event) {
    const course = event.target.closest('.course-item');
    if (!course) return;

    const courseId = course.id;
    const prereqs = course.dataset.prereqs;

    if (course.classList.contains('approved')) {
        return; // Already approved, do nothing
    }

    if (arePrereqsMet(prereqs)) {
        approvedCourses.add(courseId);
        saveState();
        updateCourseStates();
    } else {
        alert('Debes aprobar las siguientes materias primero:\n' + prereqs.split(',').join('\n'));
    }
}

// Reset the malla
function resetMalla() {
    if (confirm('¿Estás seguro de que quieres reiniciar la malla? Esto borrará todo tu progreso.')) {
        approvedCourses.clear();
        localStorage.removeItem('approvedCoursesUNLaR');
        updateCourseStates();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateCourseStates();
    courses.forEach(course => {
        course.addEventListener('click', handleCourseClick);
    });
});
