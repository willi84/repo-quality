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
            const skills = document.querySelectorAll(source);
            const target = e.target as HTMLInputElement;

            if (target.value === '') {
                // reset search
                for (const skill of skills) {
                    skill.classList.remove('hidden');
                    const valueItem = skill.querySelector('.skill-value');
                    const placeholder = skill.querySelector('.skill-search');
                    valueItem?.classList.remove('hidden');
                    placeholder?.classList.add('hidden');
                }
            } else {
                let i = 0;
                for (const skill of skills) {
                    const valueItem = skill.querySelector(
                        '.skill-value'
                    ) as HTMLElement;
                    const placeholder = skill.querySelector(
                        '.skill-search'
                    ) as HTMLElement;
                    const skillValue: string = valueItem?.innerText;
                    if (
                        skill.textContent
                            ?.toLowerCase()
                            .includes(target.value.toLowerCase())
                    ) {
                        skill.classList.remove('hidden');
                        valueItem?.classList.add('hidden');
                        skill
                            .querySelector('.skill-search')
                            ?.classList.remove('hidden');
                        if (placeholder) {
                            const html = getHighlightedText(
                                skillValue,
                                target.value
                            );
                            placeholder.innerHTML = `${html}`;
                        }
                        i += 1;
                    } else {
                        valueItem?.classList.remove('hidden');
                        placeholder?.classList.add('hidden');
                        skill.classList.add('hidden');
                        // placeholder.innerHTML = '';
                    }
                }
                const noResultItem: HTMLElement | null =
                    searchArea?.querySelector('.search__no-result');
                if (noResultItem) {
                    console.log('noresult');
                    const searchItem: HTMLElement | null =
                        noResultItem.querySelector('.search__value');
                    if (i === 0) {
                        if (searchItem !== null) {
                            searchItem.innerText = `${target.value}`;
                        }
                        noResultItem?.classList.remove('search__info--hidden');
                    } else {
                        noResultItem?.classList.add('search__info--hidden');
                    }
                }
            }
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
