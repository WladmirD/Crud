$(document).ready(function () {
    const employeeRef = db.collection("employees");
    let deleteIDs = [];
    let lastVisibleEmployeeSnapShot = {};

    // GET TOTAL SIZE
    employeeRef.onSnapshot(snapshot => {
        let size = snapshot.size;
        $('.count').text(size);
        if (size == 0) {
            $('#selectAll').attr('disabled', true);
        } else {
            $('#selectAll').attr('disabled', false);
        }
    });


    // REAL TIME LISTENER
    employeeRef.limit(50).onSnapshot(snapshot => {
        let changes = snapshot.docChanges();
        changes.forEach(change => {
            if (change.type == 'added') {
                renderEmployee(change.doc);
            } else if (change.type == 'modified') {
                $('tr[data-id=' + change.doc.id + ']').remove();
                renderEmployee(change.doc);
            } else if (change.type == 'removed') {
                $('tr[data-id=' + change.doc.id + ']').remove();
            }
        });
        lastVisibleEmployeeSnapShot = snapshot.docs[snapshot.docs.length - 1];
    });


    // DISPLAY
    function renderEmployee(document) {
        
        let item = `<tr data-id="${document.id}">

        <td class="countr"></td>
        <td>${document.data().name}</td>
        <td>${document.data().lastname}</td>
        <td>${document.data().email}</td>

        <td>${document.data().phone}</td>
        <td>
        <a href="#" id="${document.id}" class="edit js-edit-employee"><i class="btn btn-warning" >Update</i>
        </a>
        </td>

        <td>
        <a href="#" id="${document.id}" class="delete js-delete-employee"><b class="btn btn-danger" >Delete</b>
        </a>
        </td>
    </tr>`;
        $('#employee-table').append(item);
        // Activate tooltip
        $('[data-toggle="tooltip"]').tooltip();


    }

    // ADD EMPLOYEE
    $("#add-employee-form").submit(function (event) {
        event.preventDefault();
        db.collection('employees').add({
                name: $('#employee-name').val(),
                lastname: $('#employee-lastname').val(),
                email: $('#employee-email').val(),
 
                phone: $('#employee-phone').val()
            }).then(function () {
                console.log("Document successfully written!");
                $("#addEmployeeModal").modal('hide');
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    });

    // DELETE EMPLOYEE
    $(document).on('click', '.js-delete-employee', function () {
        let id = $(this).attr('id');
        $('#delete-employee-form').attr('delete-id', id);
        $('#deleteEmployeeModal').modal('show');
    });

    $("#delete-employee-form").submit(function (event) {
        event.preventDefault();
        let id = $(this).attr('delete-id');
        if (id != undefined) {
            db.collection('employees').doc(id).delete()
                .then(function () {
                    console.log("Document successfully delete!");
                    $("#deleteEmployeeModal").modal('hide');
                })
                .catch(function (error) {
                    console.error("Error deleting document: ", error);
                });
        } else {
            let checkbox = $('table tbody input:checked');
            checkbox.each(function () {
                db.collection('employees').doc(this.value).delete()
                    .then(function () {
                        console.log("Document successfully delete!");
                    })
                    .catch(function (error) {
                        console.error("Error deleting document: ", error);
                    });
            });
            $("#deleteEmployeeModal").modal('hide');
        }
    });

    // UPDATE EMPLOYEE
    $(document).on('click', '.js-edit-employee', function () {
        let id = $(this).attr('id');
        $('#edit-employee-form').attr('edit-id', id);
        db.collection('employees').doc(id).get().then(function (document) {
            if (document.exists) {
                $('#edit-employee-form #employee-name').val(document.data().name);
                $('#edit-employee-form #employee-lastname').val(document.data().lastname);

                $('#edit-employee-form #employee-email').val(document.data().email);
                $('#edit-employee-form #employee-phone').val(document.data().phone);
                $('#editEmployeeModal').modal('show');
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    });

    $("#edit-employee-form").submit(function (event) {
        event.preventDefault();
        let id = $(this).attr('edit-id');
        db.collection('employees').doc(id).update({
            name: $('#edit-employee-form #employee-name').val(),
            lastname: $('#edit-employee-form #employee-lastname').val(),
            email: $('#edit-employee-form #employee-email').val(),

            phone: $('#edit-employee-form  #employee-phone').val()
        });
        $('#editEmployeeModal').modal('hide');
    });

    $("#addEmployeeModal").on('hidden.bs.modal', function () {
        $('#add-employee-form .form-control').val('');
    });

    $("#editEmployeeModal").on('hidden.bs.modal', function () {
        $('#edit-employee-form .form-control').val('');
    });





});


// CENTER MODAL
(function ($) {
    "use strict";

    function centerModal() {
        $(this).css('display', 'block');
        var $dialog = $(this).find(".modal-dialog"),
            offset = ($(window).height() - $dialog.height()) / 2,
            bottomMargin = parseInt($dialog.css('marginBottom'), 10);

        if (offset < bottomMargin) offset = bottomMargin;
        $dialog.css("margin-top", offset);
    }

    $(document).on('show.bs.modal', '.modal', centerModal);
    $(window).on("resize", function () {
        $('.modal:visible').each(centerModal);
    });
}(jQuery));