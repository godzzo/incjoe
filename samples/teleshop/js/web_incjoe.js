
$(() => {
    $('form[data-incjoe-append]').each((idx, el) => {
        const appendId = $(el).attr('data-incjoe-append');

        // TODO get form elements as JSON, and call template
        const content = '';

        $(appendId).append(content);
    });
})
