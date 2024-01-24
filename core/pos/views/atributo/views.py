from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.generic import ListView, UpdateView, CreateView, DeleteView

from core.pos.forms import AtributoForm
from core.pos.mixins import ValidatePermissionRequiredMixin
from core.pos.models import Atributos


class AtributosListView(ValidatePermissionRequiredMixin, ListView):
    model = Atributos
    template_name = 'atributo/list.html'
    permission_required = 'view_atributos'

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'search':
                data = []
                for atributo in Atributos.objects.all():
                    i = {
                        'id': atributo.id,
                        'producto': atributo.producto.name,
                        'atributo': atributo.atributo,
                    }
                    data.append(i)
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Listado de Atributos'
        context['create_url'] = reverse_lazy('atributo_create')
        context['list_url'] = reverse_lazy('atributos_list')
        context['entity'] = 'Atributos'
        return context


class AtributoUpdateView(ValidatePermissionRequiredMixin, UpdateView):
    model = Atributos
    form_class = AtributoForm
    template_name = 'atributo/create.html'
    success_url = reverse_lazy('atributos_list')
    url_redirect = success_url
    permission_required = 'change_atributo'

    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'edit':
                form = self.get_form()
                data = form.save()
            else:
                data['error'] = 'No ha ingresado a ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Edición de un Atributos'
        context['entity'] = 'Atributo'
        context['list_url'] = self.success_url
        context['action'] = 'edit'
        return context


class AtributoCreateView(ValidatePermissionRequiredMixin, CreateView):
    model = Atributos
    form_class = AtributoForm
    template_name = 'atributo/create.html'
    success_url = reverse_lazy('atributo_list')
    url_redirect = success_url
    permission_required = 'add_atributo'

    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'add':
                form = self.get_form()
                data = form.save()
            else:
                data['error'] = 'No ha ingresado a ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Creación de un Atributo'
        context['entity'] = 'Atributos'
        context['list_url'] = self.success_url
        context['action'] = 'add'
        return context


class AtributoDeleteView(ValidatePermissionRequiredMixin, DeleteView):
    model = Atributos
    template_name = 'atributo/delete.html'
    success_url = reverse_lazy('atributos_list')
    url_redirect = success_url
    permission_required = 'delete_atributo'

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            self.object.delete()
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Eliminación de un Atributo'
        context['entity'] = 'Atributos'
        context['list_url'] = self.success_url
        return context


class AtributoCreateView(ValidatePermissionRequiredMixin, CreateView):
    model = Atributos
    form_class = AtributoForm
    template_name = 'atributo/create.html'
    success_url = reverse_lazy('atributos_list')
    url_redirect = success_url
    permission_required = 'add_atributo'

    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'add':
                form = self.get_form()
                data = form.save()
            else:
                data['error'] = 'No ha ingresado a ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Creación de un Atributo'
        context['entity'] = 'Atributos'
        context['list_url'] = self.success_url
        context['action'] = 'add'
        return context
