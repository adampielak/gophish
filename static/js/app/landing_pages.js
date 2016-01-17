/*
	landing_pages.js
	Handles the creation, editing, and deletion of landing pages
	Author: Jordan Wright <github.com/jordan-wright>
*/
var pages = []
// Save attempts to POST to /templates/
function save(idx){
    var page = {}
    page.name = $("#name").val()
    page.html = CKEDITOR.instances["html_editor"].getData();
    if (idx != -1){
        page.id = pages[idx].id
        api.pageId.put(page)
        .success(function(data){
            successFlash("Page edited successfully!")
            load()
            dismiss()
        })
    } else {
        // Submit the page
        api.pages.post(page)
        .success(function(data){
            successFlash("Page added successfully!")
            load()
            dismiss()
        })
        .error(function(data){
            modalError(data.responseJSON.message)
        })
    }
}

function dismiss(){
    $("#modal\\.flashes").empty()
    $("#name").val("")
    $("#html_editor").val("")
    $("#newLandingPageModal").modal('hide')
}

function deletePage(idx){
    if (confirm("Delete " + pages[idx].name + "?")){
        api.pageId.delete(pages[idx].id)
        .success(function(data){
            successFlash(data.message)
            load()
        })
    }
}

function importSite(){
    url = $("#url").val()
    if (!url){
        modalError("No URL Specified!")
    } else {
        api.clone_site({
	    url: url,
            include_resources: false
	})
	.success(function(data){
	    console.log($("#html_editor"))
	    $("#html_editor").val(data.html)
            $("#importSiteModal").modal("hide")
	})
	.error(function(data){
            modalError(data.responseJSON.message)	
	})
    }
}

function edit(idx){
    $("#modalSubmit").unbind('click').click(function(){save(idx)})
    $("#html_editor").ckeditor()
    var page = {}
    if (idx != -1) {
        page = pages[idx]
        $("#name").val(page.name)
        $("#html_editor").val(page.html)
    }
}

function load(){
/*
    load() - Loads the current pages using the API
*/
    $("#pagesTable").hide()
    $("#emptyMessage").hide()
    $("#loading").show()
    api.pages.get()
    .success(function(ps){
        pages = ps
        $("#loading").hide()
        if (pages.length > 0){
            $("#pagesTable").show()
            pagesTable = $("#pagesTable").DataTable({
                columnDefs: [
                    { orderable: false, targets: "no-sort" }
                ]
            });
            pagesTable.clear()
            $.each(pages, function(i, page){
                pagesTable.row.add([
                    page.name,
                    moment(page.modified_date).format('MMMM Do YYYY, h:mm:ss a'),
                    "<div class='pull-right'><button class='btn btn-primary' data-toggle='modal' data-target='#newLandingPageModal' onclick='edit(" + i + ")'>\
                    <i class='fa fa-pencil'></i>\
                    </button>\
                    <button class='btn btn-danger' onclick='deletePage(" + i + ")'>\
                    <i class='fa fa-trash-o'></i>\
                    </button></div>"
                ]).draw()
            })
        } else {
            $("#emptyMessage").show()
        }
    })
    .error(function(){
        $("#loading").hide()
        errorFlash("Error fetching pages")
    })
}

$(document).ready(function(){    
    // Setup multiple modals
    // Code based on http://miles-by-motorcycle.com/static/bootstrap-modal/index.html
    $('.modal').on('hidden.bs.modal', function( event ) {
        $(this).removeClass( 'fv-modal-stack' );
            $('body').data( 'fv_open_modals', $('body').data( 'fv_open_modals' ) - 1 );
    });
    $( '.modal' ).on( 'shown.bs.modal', function ( event ) {
        // Keep track of the number of open modals
        if ( typeof( $('body').data( 'fv_open_modals' ) ) == 'undefined' )
        {
            $('body').data( 'fv_open_modals', 0 );
        }
        // if the z-index of this modal has been set, ignore.
        if ( $(this).hasClass( 'fv-modal-stack' ) )
        {
            return;
        }
        $(this).addClass( 'fv-modal-stack' );
	// Increment the number of open modals
        $('body').data( 'fv_open_modals', $('body').data( 'fv_open_modals' ) + 1 );
	// Setup the appropriate z-index
        $(this).css('z-index', 1040 + (10 * $('body').data( 'fv_open_modals' )));
        $( '.modal-backdrop' ).not( '.fv-modal-stack' ).css( 'z-index', 1039 + (10 * $('body').data( 'fv_open_modals' )));
        $( '.modal-backdrop' ).not( 'fv-modal-stack' ).addClass( 'fv-modal-stack' ); 
    });
    $.fn.modal.Constructor.prototype.enforceFocus = function() {
        $( document )
        .off( 'focusin.bs.modal' ) // guard against infinite focus loop
        .on( 'focusin.bs.modal', $.proxy( function( e ) {
            if (
                this.$element[ 0 ] !== e.target && !this.$element.has( e.target ).length
                // CKEditor compatibility fix start.
                && !$( e.target ).closest( '.cke_dialog, .cke' ).length
                // CKEditor compatibility fix end.
            ) {
                this.$element.trigger( 'focus' );
            }
        }, this ) );
    }; 
    load()
})
