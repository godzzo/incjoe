
$(() => {
    // LoadTemplates();
    $('[data-incjoe-submit]').each((idx, el) => {
        const action = $(el).attr('data-incjoe-submit');


        $(el).click((evt) => {

            const el = $(evt.currentTarget);

            const form = el.closest('form');
            const toSel = el.data('incjoe-target');
            const template = GetTemplateName(el, toSel);

            FormSave(form[0], template, toSel, action);
    
            const modal = el.closest( "[role='dialog']" );

            modal.modal('toggle');

            form[0].reset();
        });

    });
})

function GetTemplateName(submitEl, targetSelector) {
    
    const el = $(targetSelector);

    if ( submitEl.data('incjoe-template') ) {
        return submitEl.data('incjoe-template');
    } else if ( el.data('incjoe-template') ) {
        return el.data('incjoe-template');
    } else if ( el.children('[data-incjoe-template]').length > 0) {
        return $(el.children('[data-incjoe-template]')[0]).data('incjoe-template');
    } else {
        console.error('Template name not found!', el);

        return null;
    }
}

function GetTemplate(name) {
    return unescape(templates[name]);
}

function RenderTemplate(name, data) {
    return Mustache.to_html( GetTemplate(name), data );
}

function FormSave(form, template, toSel, action) {
    const data = FormToData(form);

    data.template = template;
    data._position = -1;
    data._time = new Date().getTime();

    const content = RenderTemplate(template, data);

    if (action == 'append') {
        $(toSel).append(content);
    } else if (action == 'prepend') {
        $(toSel).prepend(content);
    } else {
        $(toSel).html(content);
    }
}

function FormToData(form) {
    const els = form.elements;
    const data = {};

    for (const el of els) { 
        console.log(el);

        data[el.name] = $(el).val();
    }

    return data;
}
