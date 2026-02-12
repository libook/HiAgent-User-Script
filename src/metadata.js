const splitUrl = () => {
    const pathSplit = window.location.pathname.split('/');
    // /product/llm/personal/personal-xxxxxx/application/xxxxxxx/arrange
    if (pathSplit.length >= 7 && pathSplit[3] === 'personal' && pathSplit[5] === 'application') {
        return pathSplit;
    }
    return null;
};

export default {
    get application() {
        return splitUrl()[6];
    },
    get personal() {
        return splitUrl()[4];
    },
};
