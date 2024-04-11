import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { TarefaService } from 'src/app/service/tarefa.service';
import { Tarefa } from '../interface/tarefa';
import { checkButtonTrigger, filterTrigger, flyInOutTrigger, formButtonTrigger, highlightedStateTrigger, shownStateTrigger } from '../animations';

@Component({
  selector: 'app-lista-tarefas',
  templateUrl: './lista-tarefas.component.html',
  styleUrls: ['./lista-tarefas.component.css'],
  animations: [highlightedStateTrigger, shownStateTrigger, checkButtonTrigger, filterTrigger, formButtonTrigger, flyInOutTrigger]


})
export class ListaTarefasComponent implements OnInit {
  listaTarefas: Tarefa[] = [];
  formAberto: boolean = true;
  categoria: string = '';
  validado: boolean = false;
  campoDescricao: boolean = false;
  indexTarefa = -1;
  id: number = 0;
  campoBusca: string = '';
  tafrefasFiltradas: Tarefa[] = [];


  formulario: FormGroup = this.fomBuilder.group({
    id: [0],
    descricao: ['', Validators.compose([
      Validators.required,
      Validators.minLength(3)])],
    statusFinalizado: [false, Validators.required],
    categoria: ['Casa', Validators.required],
    prioridade: ['Alta', Validators.required],
  });


  constructor(
    private service: TarefaService,
    private router: Router,
    private fomBuilder: FormBuilder
  ) {}

  ngOnInit(): Tarefa[] {
    this.service.listar(this.categoria).subscribe((listaTarefas) => {
      this.listaTarefas = listaTarefas;
      this.tafrefasFiltradas = listaTarefas;
    });
    return this.tafrefasFiltradas;
  }

  filtrarTafrefasPorDescricao(descricao: string) {
    this.campoBusca = descricao.trim().toLowerCase()
    if (descricao) {
      this.tafrefasFiltradas = this.listaTarefas.filter(tarefa =>
        tarefa.descricao.toLowerCase().includes(this.campoBusca))
    } else {
      this.tafrefasFiltradas = this.listaTarefas
    }
  }

  mostrarOuEsconderFormulario() {
    this.formAberto = !this.formAberto;
    this.resetarFormulario();
  }

  salvarTarefa() {
    if (this.formulario.value.id) {
      this.editarTarefa();
    } else {
      this.criarTarefa();
    }
  }

  editarTarefa() {
    this.service.editar(this.formulario.value).subscribe({
      complete: () => this.atualizarComponente(),
    });
  }

  criarTarefa() {
    this.service.criar(this.formulario.value).subscribe({
      complete: () => this.atualizarComponente(),
    });
  }

  excluirTarefa(id: number) {
    if (id) {
      this.service.excluir(id).subscribe({
        complete: () => this.recarregarComponente(),
      });
    }
  }

  cancelar() {
    this.resetarFormulario();
    this.formAberto = false;
  }

  resetarFormulario() {
    this.formulario.reset({
      descricao: '',
      statusFinalizado: false,
      categoria: '',
      prioridade: '',
    });
  }

  recarregarComponente() {
    this.router.navigate(['/listaTarefas']);
  }

  atualizarComponente() {
    this.recarregarComponente();
    this.resetarFormulario();
  }

  carregarParaEditar(id: number) {
    this.service.buscarPorId(id!).subscribe((tarefa) => {
      this.formulario = this.fomBuilder.group({
        id: [tarefa.id],
        descricao: [tarefa.descricao],
        categoria: [tarefa.categoria],
        statusFinalizado: [tarefa.statusFinalizado],
        prioridade: [tarefa.prioridade],
      });
    });
    this.formAberto = true;
  }

  finalizarTarefa(id: number) {
    this.id = id;
    this.service.buscarPorId(id!).subscribe((tarefa) => {
      this.service.atualizarStatusTarefa(tarefa).subscribe(() => {
        this.listarAposCheck();
      });
    });
  }

  listarAposCheck() {
    this.service.listar(this.categoria).subscribe((listaTarefas) => {
      this.tafrefasFiltradas = listaTarefas;
    });
  }

  habilitarBotao(): string {
    if (this.formulario.valid) {
      return 'botao-salvar';
    } else return 'botao-desabilitado';
  }

  campoValidado(campoAtual: string): string {
    if (
      this.formulario.get(campoAtual)?.errors &&
      this.formulario.get(campoAtual)?.touched
    ) {
      this.validado = false;
      return 'form-tarefa input-invalido';
    } else {
      this.validado = true;
      return 'form-tarefa';
    }
  }

  validaDescricao(): string {
    if (
      this.formulario.get('descricao')?.errors?.['minlength']
    ) {
      this.campoDescricao = false;
      return 'form-tarefa input-invalido';
    } else {
      this.campoDescricao = true;
      return 'form-tarefa';
    }
  }
}
