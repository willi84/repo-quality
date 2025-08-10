import { time } from 'console';


// TODO: Perforamcen auf 1500

// idee alle values in attribut
export const createSearch = (target: string, uid: string, source: string) => {
    const searchArea = document.querySelector(`[${target}="${uid}"]`);
    if (searchArea) {
        const filters = searchArea.querySelectorAll('[data-filter-type]');
        for (const filter of filters) {
            filter.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const isActive = target.getAttribute('data-active');
                if (isActive === 'true') {
                    target.setAttribute('data-active', 'false');
                } else {
                    target.setAttribute('data-active', 'true');
                }
                const filterType = target.getAttribute('data-filter-type');
                const filterValue = target.getAttribute('data-filter-value');
                if (filterType) {
                    const query = `[data-${filterType}="${filterValue}"]`;
                    const skills = document.querySelectorAll(
                        `${query}`
                    ) as NodeListOf<HTMLElement>;
                    for (const skill of skills) {
                        const dataHidden = skill.getAttribute('data-hidden');
                        if (dataHidden === 'true') {
                            skill.setAttribute('data-hidden', 'false');
                        } else {
                            skill.setAttribute('data-hidden', 'true');
                        }
                    }
                }
            });
        }
        const input: HTMLInputElement | null =
            searchArea?.querySelector('input');
        input?.addEventListener('keyup', (e) => {
            //write to local storage
            const target = e.target as HTMLInputElement;
            localStorage.setItem('search', target?.value || '');
            const start = new Date().getTime();
            const skills = document.querySelectorAll(source);
            const searchValue = target.value.toLowerCase()

            const area = searchArea.querySelector('.search__result');
            const nonHiddenSkills = document.querySelectorAll(`${source}:not(.hidden)`);
            const noResultItem = area?.querySelector('.search__no-result');
            const hasResultItem = area?.querySelector('.search__has-result');
            const defaultItem = area?.querySelector('.search__default');
            const searchItem = area?.querySelector('.search__value') as HTMLElement;
            const searchNumResults = area?.querySelector('.search__num-results') as HTMLElement;
            if (target.value === '') { // reset search
                // info area
                noResultItem?.classList.add('hidden');
                hasResultItem?.classList.add('hidden');
                defaultItem?.classList.remove('hidden');

                //hide placeholders
                const st = new Date().getTime();
                for (const skill of skills) {
                    const placeholders = skill.querySelectorAll('.skill-search');
                    for (const placeholder of placeholders) {
                        placeholder.classList.add('hidden');
                    }
                }
                console.log(`Reset search took: ${new Date().getTime() - st}ms`);
            } else {
                for (const skill of skills) {
                    const searchValues = skill.getAttribute('data-searchable');
                    const hasValue = searchValues?.includes(searchValue);
                    if (hasValue) {
                        skill.classList.remove('hidden');
                    } else {
                        skill.classList.add('hidden');
                    }
                }

                // info area
                defaultItem?.classList.add('hidden');
                if (nonHiddenSkills.length === 0) {
                    noResultItem?.classList.remove('hidden');
                    hasResultItem?.classList.add('hidden');
                    if (searchItem) {
                        searchItem.innerText = `${target.value}`;
                    }
                } else {
                    noResultItem?.classList.add('hidden');
                    hasResultItem?.classList.remove('hidden');
                    if (searchNumResults) {
                        searchNumResults.innerText = `${nonHiddenSkills.length}`;
                    }
                }
            }
            console.log(`Search for ${target.value} took: ${new Date().getTime() - start}ms`);
        });
    }
};
export const getHighlightedText = (text: string, searchTerm: string) => {
    if (searchTerm === '') return text;
    // Split the text by the highlight term
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts
        .map((part, i) =>
            part.toLowerCase() === searchTerm.toLowerCase()
                ? `<span class="search-match">${part}</span>`
                : part
        )
        .join('');
};
export const searchRow = (target: HTMLElement) => {
    const start = new Date().getTime();
    const targetValue = localStorage.getItem('search')?.toLowerCase() || '';
    if (!targetValue || targetValue === '') {
        return;
    }
    const valueItems = target.querySelectorAll('.skill-value');
    for (const valueItem of valueItems) {
        const item = valueItem as HTMLElement;
        const skillValue: string = item.innerText;
        const itemValue = skillValue?.toLowerCase();
        const placeholder =
            item?.parentElement?.querySelector(
                '.skill-search'
            ); // as HTMLElement;
        if (itemValue.includes(targetValue)) {
        //     valueItem?.classList.add('hidden');
            placeholder?.classList.remove('hidden');
            if (placeholder) {
                const html = getHighlightedText(skillValue, targetValue);
                placeholder.innerHTML = `${html}`;
            }
        } else {
            placeholder?.classList.add('hidden');
        }
    }
    console.log(`searchRow [${targetValue}] took: ${new Date().getTime() - start}ms`);
};

const rows = document.querySelectorAll('[data-active="true"]');

const io = new IntersectionObserver(
    (entries) => {
        for (const entry of entries) {
            entry.target.classList.toggle('is-visible', entry.isIntersecting);
            // if isVisibel highlight search
            if (entry.isIntersecting) {
                searchRow(entry.target as HTMLElement);
            }
        }
    },
    { threshold: 0.1 }
);

rows.forEach((r) => io.observe(r));
localStorage.setItem('search', '');
