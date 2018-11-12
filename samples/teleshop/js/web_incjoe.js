
$(() => {
    // LoadTemplates();
    $('[data-incjoe-submit]').each((idx, el) => {
        const action = $(el).attr('data-incjoe-submit');


        $(el).click((evt) => {

            const el = $(evt.currentTarget);

            const form = el.closest('form');
            const toSel = el.data('incjoe-target');
            const template = GetTemplateName(el, toSel);

            if (action == 'append') {
                FormAppendTo(form[0], template, toSel);
            } else if (action == 'prepend') {
                FormPrependTo(form[0], template, toSel);
            } else if (action == 'replace') {
                FormReplace(form[0], template, toSel);
            } else {
                console.error(`incjoe-submit : Action not supported ${action} !`);
            }
    
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

function FormAppendTo(form, template, toSel) {
    const data = FormToData(form);

    const content = RenderTemplate(template, data);

    $(toSel).append(content);
}

function FormPrependTo(form, template, toSel) {
    const data = FormToData(form);

    const content = RenderTemplate(template, data);

    $(toSel).prepend(content);
}

function FormReplace(form, template, toSel) {
    const data = FormToData(form);

    const content = RenderTemplate(template, data);

    $(toSel).html(content);
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
