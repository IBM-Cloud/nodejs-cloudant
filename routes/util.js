module.exports.sanitizeInput = (str) => {
    return String(str).replace(/&(?!amp;|lt;|gt;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

module.exports.createResponseData = (id, name, value, attachments) => {

    const responseData = {
        id: id,
        name: module.exports.sanitizeInput(name),
        value: module.exports.sanitizeInput(value),
        attachements: []
    };


    attachments.forEach((item) => {
        const attachmentData = {
            content_type: item.type,
            key: item.key,
            url: '/api/favorites/attach?id=' + id + '&key=' + item.key
        };
        responseData.attachements.push(attachmentData);

    });
    return responseData;
};
